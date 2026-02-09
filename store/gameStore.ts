import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType, Reward } from '@/types';
import {
    type TaskCategory,
    type ShopItemId,
    CATEGORY_ATTRIBUTE_MAP,
    DEFAULT_CATEGORY_XP,
    getAttributeLevel,
    BASE_REWARDS,
    FLASK_CONFIG,
    HOLLOW_CONFIG,
    SHOP_ITEMS,
} from '@/types/categories';

// Souls reward function - takes taskId, returns souls
// For now returns fixed value, later will be driven by LLM judge
export function getSoulsReward(taskId: string): number {
    // TODO: Integrate LLM judge here
    // For now, return a fixed value of 5 souls per task
    return 5;
}

interface Inventory {
    estus_flask: number;
    human_effigy: number;
    ring_of_protection: number;
    golden_pine_resin: number;
}

interface ActiveBuffs {
    ringOfProtection: boolean;  // Next fail costs 50% less HP
    goldenPineResin: boolean;   // Next complete gives 2x Souls
}

// History entry for tracking completed tasks
export interface HistoryEntry {
    id: string;
    taskId: string;
    taskTitle: string;
    taskType: TaskType;
    category: TaskCategory;
    action: 'completed' | 'failed' | 'positive' | 'negative';
    soulsEarned?: number;
    timestamp: string;  // ISO date string
}

interface GameState {
    // Core stats
    hp: number;
    baseMaxHp: number;          // True max HP before hollow
    xp: number;
    xpToLevel: number;
    level: number;
    soundEnabled: boolean;

    // Souls currency (lose 50% on death)
    souls: number;

    // Category XP tracking (100 XP = 1 attribute level)
    categoryXp: Record<TaskCategory, number>;

    // Flask system
    flasks: number;
    maxFlasks: number;

    // Inventory
    inventory: Inventory;
    activeBuffs: ActiveBuffs;

    // Category tracking for diminishing returns
    categoryStreak: Record<TaskCategory, number>;
    lastCategory: TaskCategory | null;

    // Hollowing (0-5, each level = -10% max HP)
    hollowLevel: number;

    // Death tracking
    isDowned: boolean;
    deathCount: number;
    soulsLostTotal: number;

    // Tasks
    habits: Task[];
    dailies: Task[];
    todos: Task[];
    rewards: Reward[];

    // History log
    history: HistoryEntry[];

    // Computed getters (as functions)
    getMaxHp: () => number;
    getAttributeLevel: (category: TaskCategory) => number;

    // Actions
    gainXp: (xpAmount: number, category?: TaskCategory) => void;
    incrementCategoryCounter: (category: TaskCategory) => void;
    gainSouls: (amount: number) => void;
    spendSouls: (amount: number) => boolean;
    loseHp: (amount: number) => void;
    stakeHp: (amount: number) => boolean;
    recoverHp: (amount: number) => void;
    useFlask: () => boolean;
    buyItem: (itemId: ShopItemId) => boolean;
    useItem: (itemId: ShopItemId) => boolean;
    refillFlasks: () => void;
    revive: () => void;
    updateCategoryStreak: (category: TaskCategory) => void;
    toggleSound: () => void;
    resetStats: () => void;

    // Task actions
    addTask: (type: TaskType, title: string, category?: TaskCategory, isCritical?: boolean) => void;
    updateTask: (type: TaskType, taskId: string, updates: Partial<Task>) => void;
    toggleChecklistItem: (type: TaskType, taskId: string, checklistItemId: string) => void;
    completeTask: (type: TaskType, taskId: string) => void;
    failTask: (type: TaskType, taskId: string) => void;
    deleteTask: (type: TaskType, taskId: string) => void;

    // Reward actions
    addReward: (title: string, cost: number, notes?: string) => void;
    updateReward: (rewardId: string, updates: Partial<Reward>) => void;
    deleteReward: (rewardId: string) => void;
    buyReward: (rewardId: string) => void;
}

// XP required for each level
function getXpToLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Starting HP (Glass Cannon)
const STARTING_HP = 50;

const INITIAL_TASKS = {
    habits: [
        {
            id: 'habit-1',
            title: 'Drink Water',
            type: 'habit' as TaskType,
            category: 'self_care' as TaskCategory,
            difficulty: 'easy' as const,
            baseSouls: BASE_REWARDS.habit.souls,
            baseXp: BASE_REWARDS.habit.xp,
            hpStake: BASE_REWARDS.habit.hpStake,
            isCritical: false,
        },
        {
            id: 'habit-2',
            title: 'Read for 15 minutes',
            type: 'habit' as TaskType,
            category: 'productivity' as TaskCategory,
            difficulty: 'easy' as const,
            baseSouls: BASE_REWARDS.habit.souls,
            baseXp: BASE_REWARDS.habit.xp,
            hpStake: BASE_REWARDS.habit.hpStake,
            isCritical: false,
        },
    ],
    dailies: [
        {
            id: 'daily-1',
            title: 'Morning Exercise',
            type: 'daily' as TaskType,
            category: 'fitness' as TaskCategory,
            difficulty: 'medium' as const,
            baseSouls: BASE_REWARDS.daily.souls,
            baseXp: BASE_REWARDS.daily.xp,
            hpStake: BASE_REWARDS.daily.hpStake,
            isCritical: false,
        },
        {
            id: 'daily-2',
            title: 'Review Goals',
            type: 'daily' as TaskType,
            category: 'productivity' as TaskCategory,
            difficulty: 'easy' as const,
            baseSouls: BASE_REWARDS.daily.souls,
            baseXp: BASE_REWARDS.daily.xp,
            hpStake: BASE_REWARDS.daily.hpStake,
            isCritical: false,
        },
    ],
    todos: [
        {
            id: 'todo-1',
            title: 'Complete project setup',
            type: 'todo' as TaskType,
            category: 'productivity' as TaskCategory,
            difficulty: 'medium' as const,
            baseSouls: BASE_REWARDS.todo.souls,
            baseXp: BASE_REWARDS.todo.xp,
            hpStake: BASE_REWARDS.todo.hpStake,
            isCritical: false,
        },
        {
            id: 'todo-2',
            title: 'Go for a run',
            type: 'todo' as TaskType,
            category: 'sports' as TaskCategory,
            difficulty: 'medium' as const,
            baseSouls: BASE_REWARDS.todo.souls,
            baseXp: BASE_REWARDS.todo.xp,
            hpStake: BASE_REWARDS.todo.hpStake,
            isCritical: false,
        },
    ],
};

const INITIAL_STATE = {
    hp: STARTING_HP,
    baseMaxHp: STARTING_HP,
    xp: 0,
    xpToLevel: getXpToLevel(1),
    level: 1,
    soundEnabled: true,

    // Souls currency
    souls: 0,

    // Category XP (all start at 0)
    categoryXp: { ...DEFAULT_CATEGORY_XP },

    // Flasks
    flasks: 1,
    maxFlasks: FLASK_CONFIG.maxFlasks,

    // Inventory
    inventory: {
        estus_flask: 0,
        human_effigy: 0,
        ring_of_protection: 0,
        golden_pine_resin: 0,
    },
    activeBuffs: {
        ringOfProtection: false,
        goldenPineResin: false,
    },

    // Category tracking
    categoryStreak: {
        productivity: 0,
        sports: 0,
        fitness: 0,
        self_care: 0,
        creativity: 0,
        social: 0,
    },
    lastCategory: null as TaskCategory | null,

    // Hollowing
    hollowLevel: 0,

    // Death
    isDowned: false,
    deathCount: 0,
    soulsLostTotal: 0,

    // History
    history: [] as HistoryEntry[],

    // Rewards
    rewards: [
        {
            id: 'reward-1',
            title: 'Play Mobile Game (30m)',
            cost: 100,
            notes: 'Enjoy some guilt-free gaming time!',
        }
    ],

    ...INITIAL_TASKS,
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            // Computed: effective max HP considering hollowing
            getMaxHp: () => {
                const state = get();
                const reduction = state.hollowLevel * HOLLOW_CONFIG.hpReductionPerLevel;
                return Math.floor(state.baseMaxHp * Math.max(HOLLOW_CONFIG.minHpPercent, 1 - reduction));
            },

            // Computed: attribute level from category XP
            getAttributeLevel: (category: TaskCategory) => {
                const state = get();
                return getAttributeLevel(state.categoryXp[category]);
            },

            // gainXp: adds XP to global counter for player leveling
            gainXp: (xpAmount: number) => {
                const state = get();
                // Downed players gain 50% less XP
                const effectiveXp = state.isDowned ? Math.floor(xpAmount * 0.5) : xpAmount;
                let newXp = state.xp + effectiveXp;
                let newLevel = state.level;
                let newXpToLevel = state.xpToLevel;

                // Level up logic
                while (newXp >= newXpToLevel) {
                    newXp -= newXpToLevel;
                    newLevel += 1;
                    newXpToLevel = getXpToLevel(newLevel);
                }

                set({
                    xp: newXp,
                    level: newLevel,
                    xpToLevel: newXpToLevel,
                });
            },

            // incrementCategoryCounter: always adds 1 to category counter (for attribute leveling)
            incrementCategoryCounter: (category: TaskCategory) => {
                set((state) => ({
                    categoryXp: {
                        ...state.categoryXp,
                        [category]: state.categoryXp[category] + 1,
                    },
                }));
            },

            gainSouls: (amount: number) => {
                const state = get();
                // Apply golden pine resin buff
                const multiplier = state.activeBuffs.goldenPineResin ? 2 : 1;
                const finalAmount = amount * multiplier;

                set({
                    souls: state.souls + finalAmount,
                    activeBuffs: {
                        ...state.activeBuffs,
                        goldenPineResin: false  // Consume buff
                    }
                });
            },

            spendSouls: (amount: number) => {
                const state = get();
                if (state.souls < amount) return false;
                set({ souls: state.souls - amount });
                return true;
            },

            loseHp: (amount: number) => {
                const state = get();
                const maxHp = state.getMaxHp();

                // Apply ring of protection buff
                const reduction = state.activeBuffs.ringOfProtection ? 0.5 : 1;
                const actualDamage = Math.ceil(amount * reduction);
                const newHp = Math.max(0, state.hp - actualDamage);

                // Death: lose 50% of souls, gain hollow level
                if (newHp === 0 && !state.isDowned) {
                    const soulsLost = Math.floor(state.souls * 0.5);
                    const newHollowLevel = Math.min(
                        state.hollowLevel + 1,
                        HOLLOW_CONFIG.maxHollowLevel
                    );

                    set({
                        hp: 0,
                        isDowned: true,
                        deathCount: state.deathCount + 1,
                        souls: state.souls - soulsLost,
                        soulsLostTotal: state.soulsLostTotal + soulsLost,
                        hollowLevel: newHollowLevel,
                        activeBuffs: { ...state.activeBuffs, ringOfProtection: false },
                    });
                } else {
                    set({
                        hp: newHp,
                        activeBuffs: {
                            ...state.activeBuffs,
                            ringOfProtection: false  // Consume buff
                        }
                    });
                }
            },

            stakeHp: (amount: number) => {
                const state = get();
                if (state.hp < amount || state.isDowned) return false;
                set({ hp: state.hp - amount });
                return true;
            },

            recoverHp: (amount: number) => {
                const state = get();
                const maxHp = state.getMaxHp();  // This already includes hollowing reduction
                set({
                    hp: Math.min(maxHp, state.hp + amount),
                });
            },

            useFlask: () => {
                const state = get();
                if (state.flasks <= 0 || state.isDowned) return false;
                const maxHp = state.getMaxHp();  // Hollowing cap enforced

                set({
                    flasks: state.flasks - 1,
                    hp: Math.min(maxHp, state.hp + FLASK_CONFIG.healAmount),  // Cannot exceed hollowed max
                });
                return true;
            },

            buyItem: (itemId: ShopItemId) => {
                const state = get();
                const item = SHOP_ITEMS[itemId];
                if (!item) return false;
                if (state.souls < item.cost) return false;

                // Estus Flask goes directly to flask slot
                if (itemId === 'estus_flask') {
                    if (state.flasks >= state.maxFlasks) return false;
                    set({
                        souls: state.souls - item.cost,
                        flasks: state.flasks + 1,
                    });
                    return true;
                }

                // Other items go to inventory
                if (state.inventory[itemId] >= item.maxQuantity) return false;
                set({
                    souls: state.souls - item.cost,
                    inventory: {
                        ...state.inventory,
                        [itemId]: state.inventory[itemId] + 1,
                    },
                });
                return true;
            },

            useItem: (itemId: ShopItemId) => {
                const state = get();
                if (state.inventory[itemId] <= 0) return false;

                const newInventory = {
                    ...state.inventory,
                    [itemId]: state.inventory[itemId] - 1,
                };

                switch (itemId) {
                    case 'estus_flask':
                        // Add to flask count
                        if (state.flasks < state.maxFlasks) {
                            set({
                                inventory: newInventory,
                                flasks: state.flasks + 1,
                            });
                            return true;
                        }
                        return false;

                    case 'human_effigy':
                        // Reduce hollow level by 1
                        if (state.hollowLevel > 0) {
                            set({
                                inventory: newInventory,
                                hollowLevel: state.hollowLevel - 1,
                            });
                            return true;
                        }
                        return false;

                    case 'ring_of_protection':
                        // Activate buff
                        set({
                            inventory: newInventory,
                            activeBuffs: { ...state.activeBuffs, ringOfProtection: true },
                        });
                        return true;

                    case 'golden_pine_resin':
                        // Activate buff
                        set({
                            inventory: newInventory,
                            activeBuffs: { ...state.activeBuffs, goldenPineResin: true },
                        });
                        return true;

                    default:
                        return false;
                }
            },

            refillFlasks: () => {
                set((state) => ({ flasks: state.maxFlasks }));
            },

            revive: () => {
                const state = get();
                const maxHp = state.getMaxHp();
                set({
                    isDowned: false,
                    hp: Math.ceil(maxHp * 0.25),
                });
            },

            updateCategoryStreak: (category: TaskCategory) => {
                set((state) => {
                    const newCategoryStreak = { ...state.categoryStreak };

                    // If same category as last, increment streak
                    if (state.lastCategory === category) {
                        newCategoryStreak[category] += 1;
                    } else {
                        // Reset all streaks except current
                        Object.keys(newCategoryStreak).forEach((key) => {
                            newCategoryStreak[key as TaskCategory] = key === category ? 1 : 0;
                        });
                    }

                    return {
                        categoryStreak: newCategoryStreak,
                        lastCategory: category,
                    };
                });
            },

            toggleSound: () => {
                set((state) => ({ soundEnabled: !state.soundEnabled }));
            },

            resetStats: () => {
                set(INITIAL_STATE);
            },

            addTask: (type: TaskType, title: string, category: TaskCategory = 'productivity', isCritical = false) => {
                const newTask: Task = {
                    id: `${type}-${Date.now()}`,
                    title,
                    type,
                    category,
                    difficulty: 'easy',
                    baseSouls: BASE_REWARDS[type].souls,
                    baseXp: BASE_REWARDS[type].xp,
                    hpStake: BASE_REWARDS[type].hpStake,
                    isCritical,
                };

                set((state) => {
                    if (type === 'habit') {
                        return { habits: [...state.habits, newTask] };
                    } else if (type === 'daily') {
                        return { dailies: [...state.dailies, newTask] };
                    } else {
                        return { todos: [...state.todos, newTask] };
                    }
                });
            },

            completeTask: (type: TaskType, taskId: string) => {
                const state = get();
                let task: Task | undefined;

                if (type === 'habit') {
                    task = state.habits.find(t => t.id === taskId);
                } else if (type === 'daily') {
                    task = state.dailies.find(t => t.id === taskId);
                } else {
                    task = state.todos.find(t => t.id === taskId);
                }

                if (task) {
                    const category = task.category || 'productivity';
                    const attributeLevel = getAttributeLevel(state.categoryXp[category]);

                    // Get souls reward from dedicated function (for LLM integration later)
                    const soulsReward = getSoulsReward(taskId);

                    // XP formula: 1 + attributeLevel
                    const xpGained = 1 + attributeLevel;

                    // Apply rewards (NO HP RECOVERY - only Souls and XP)
                    state.gainSouls(soulsReward);
                    state.gainXp(xpGained);
                    state.incrementCategoryCounter(category);

                    // Update category streak
                    state.updateCategoryStreak(category);

                    // Add to history
                    const historyEntry: HistoryEntry = {
                        id: `hist-${Date.now()}`,
                        taskId: task.id,
                        taskTitle: task.title,
                        taskType: type,
                        category,
                        action: type === 'habit' ? 'positive' : 'completed',
                        soulsEarned: soulsReward,
                        timestamp: new Date().toISOString(),
                    };
                    set((s) => ({ history: [...s.history, historyEntry] }));
                }

                // Remove completed todos
                if (type === 'todo') {
                    set((s) => ({ todos: s.todos.filter((t) => t.id !== taskId) }));
                }
            },

            failTask: (type: TaskType, taskId: string) => {
                const state = get();
                let task: Task | undefined;

                if (type === 'habit') {
                    task = state.habits.find(t => t.id === taskId);
                } else if (type === 'daily') {
                    task = state.dailies.find(t => t.id === taskId);
                } else {
                    task = state.todos.find(t => t.id === taskId);
                }

                if (task) {
                    const category = task.category || 'productivity';

                    // Critical habit fail = instant death
                    if (task.isCritical && type === 'habit') {
                        const maxHp = state.getMaxHp();
                        state.loseHp(maxHp); // Instant death
                    } else {
                        // Normal failure - deduct HP and category XP
                        state.loseHp(task.hpStake || BASE_REWARDS[type].hpStake);

                        // Deduct XP from category bucket
                        const xpPenalty = Math.floor((task.baseXp || BASE_REWARDS[type].xp) * 0.5);
                        set((s) => ({
                            categoryXp: {
                                ...s.categoryXp,
                                [category]: Math.max(0, s.categoryXp[category] - xpPenalty),
                            },
                        }));
                    }
                }
            },

            deleteTask: (type: TaskType, taskId: string) => {
                set((state) => {
                    if (type === 'habit') {
                        return { habits: state.habits.filter((t) => t.id !== taskId) };
                    } else if (type === 'daily') {
                        return { dailies: state.dailies.filter((t) => t.id !== taskId) };
                    } else {
                        return { todos: state.todos.filter((t) => t.id !== taskId) };
                    }
                });
            },

            updateTask: (type: TaskType, taskId: string, updates: Partial<Task>) => {
                set((state) => {
                    const updateFn = (tasks: Task[]) =>
                        tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));

                    if (type === 'habit') {
                        return { habits: updateFn(state.habits) };
                    } else if (type === 'daily') {
                        return { dailies: updateFn(state.dailies) };
                    } else {
                        return { todos: updateFn(state.todos) };
                    }
                });
            },

            toggleChecklistItem: (type: TaskType, taskId: string, checklistItemId: string) => {
                const state = get();
                const taskList = type === 'habit' ? state.habits : type === 'daily' ? state.dailies : state.todos;
                const task = taskList.find((t) => t.id === taskId);
                if (!task || !task.checklist) return;

                // Toggle the checklist item
                const updatedChecklist = task.checklist.map((item) =>
                    item.id === checklistItemId ? { ...item, completed: !item.completed } : item
                );

                // Check if all items are now completed
                const allCompleted = updatedChecklist.every((item) => item.completed);

                // Update the task with new checklist
                set((s) => {
                    const updateFn = (tasks: Task[]) =>
                        tasks.map((t) =>
                            t.id === taskId ? { ...t, checklist: updatedChecklist } : t
                        );

                    if (type === 'habit') {
                        return { habits: updateFn(s.habits) };
                    } else if (type === 'daily') {
                        return { dailies: updateFn(s.dailies) };
                    } else {
                        return { todos: updateFn(s.todos) };
                    }
                });

                // Auto-complete the task if all checklist items are done
                if (allCompleted && updatedChecklist.length > 0) {
                    state.completeTask(type, taskId);
                }
            },

            // Reward Actions
            addReward: (title: string, cost: number, notes?: string) => {
                const newReward: Reward = {
                    id: `reward-${Date.now()}`,
                    title,
                    cost,
                    notes
                };
                set((state) => ({ rewards: [...state.rewards, newReward] }));
            },

            updateReward: (rewardId: string, updates: Partial<Reward>) => {
                set((state) => ({
                    rewards: state.rewards.map(r => r.id === rewardId ? { ...r, ...updates } : r)
                }));
            },

            deleteReward: (rewardId: string) => {
                set((state) => ({
                    rewards: state.rewards.filter(r => r.id !== rewardId)
                }));
            },

            buyReward: (rewardId: string) => {
                const state = get();
                const reward = state.rewards.find(r => r.id === rewardId);

                if (reward && state.souls >= reward.cost) {
                    // Deduct souls
                    state.spendSouls(reward.cost);

                    // Add to history
                    const historyEntry: HistoryEntry = {
                        id: `hist-${Date.now()}`,
                        taskId: reward.id,
                        taskTitle: `Reward: ${reward.title}`,
                        taskType: 'todo', // Using 'todo' as closest type for history filter
                        category: 'self_care' as TaskCategory, // Rewards are self-care
                        action: 'completed',
                        soulsEarned: -reward.cost, // Negative earning to show cost? Or just 0? Maybe negative is better
                        timestamp: new Date().toISOString(),
                    };
                    set((s) => ({ history: [...s.history, historyEntry] }));
                }
            }
        }),
        {
            name: 'dopamine-strategy-game',

            version: 3, // Bumped for v3 migration
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as Record<string, unknown>;

                // Migration to v3
                if (version < 3) {
                    // Handle old flasks object format
                    if (state.flasks && typeof state.flasks === 'object') {
                        const oldFlasks = state.flasks as { current?: number; max?: number };
                        state.flasks = oldFlasks.current ?? 1;
                        state.maxFlasks = oldFlasks.max ?? FLASK_CONFIG.maxFlasks;
                    }

                    // Add categoryXp if missing
                    if (!state.categoryXp) {
                        state.categoryXp = { ...DEFAULT_CATEGORY_XP };
                    }

                    // Add hollowing if missing
                    if (state.hollowLevel === undefined) state.hollowLevel = 0;
                    if (state.baseMaxHp === undefined) state.baseMaxHp = state.maxHp ?? STARTING_HP;

                    // Add inventory if missing
                    if (!state.inventory) {
                        state.inventory = {
                            estus_flask: 0,
                            human_effigy: 0,
                            ring_of_protection: 0,
                            golden_pine_resin: 0,
                        };
                    }

                    // Add activeBuffs if missing
                    if (!state.activeBuffs) {
                        state.activeBuffs = {
                            ringOfProtection: false,
                            goldenPineResin: false,
                        };
                    }

                    // Remove old attributes (now computed from categoryXp)
                    delete state.attributes;

                    // Add missing fields
                    if (state.souls === undefined) state.souls = 0;
                    if (state.soulsLostTotal === undefined) state.soulsLostTotal = 0;
                    if (!state.categoryStreak) {
                        state.categoryStreak = {
                            productivity: 0,
                            sports: 0,
                            fitness: 0,
                            self_care: 0,
                            creativity: 0,
                            social: 0,
                        };
                    }
                    if (state.lastCategory === undefined) state.lastCategory = null;

                    // Add rewards if missing
                    if (!state.rewards) {
                        state.rewards = [
                            {
                                id: 'reward-1',
                                title: 'Play Mobile Game (30m)',
                                cost: 100,
                                notes: 'Enjoy some guilt-free gaming time!',
                            }
                        ];
                    }

                    // Add history if missing
                    if (!state.history) {
                        state.history = [];
                    }
                }

                return state as unknown as GameState;
            },
        }
    )
);
