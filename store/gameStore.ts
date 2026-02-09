import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType } from '@/types';
import {
    type TaskCategory,
    type AttributeType,
    CATEGORY_ATTRIBUTE_MAP,
    DEFAULT_ATTRIBUTES,
    calculateSoulsReward,
    calculateXpReward,
    BASE_REWARDS,
    FLASK_CONFIG,
} from '@/types/categories';

interface GameState {
    // Core stats
    hp: number;
    maxHp: number;
    xp: number;
    xpToLevel: number;
    level: number;
    soundEnabled: boolean;

    // Souls currency (lose 50% on death)
    souls: number;

    // User Attributes (6 stats)
    attributes: Record<AttributeType, number>;

    // Flask system
    flasks: number;
    maxFlasks: number;

    // Category tracking for diminishing returns
    categoryStreak: Record<TaskCategory, number>;
    lastCategory: TaskCategory | null;

    // Death tracking
    isDowned: boolean;
    deathCount: number;
    soulsLostTotal: number;

    // Tasks
    habits: Task[];
    dailies: Task[];
    todos: Task[];

    // Actions
    gainXp: (amount: number) => void;
    gainSouls: (amount: number) => void;
    spendSouls: (amount: number) => boolean;
    loseHp: (amount: number) => void;
    stakeHp: (amount: number) => boolean;
    recoverHp: (amount: number) => void;
    useFlask: () => boolean;
    buyFlask: () => boolean;
    refillFlasks: () => void;
    revive: () => void;
    incrementAttribute: (attr: AttributeType, amount?: number) => void;
    updateCategoryStreak: (category: TaskCategory) => void;
    toggleSound: () => void;
    resetStats: () => void;

    // Task actions
    addTask: (type: TaskType, title: string, category?: TaskCategory) => void;
    completeTask: (type: TaskType, taskId: string) => void;
    failTask: (type: TaskType, taskId: string) => void;
    deleteTask: (type: TaskType, taskId: string) => void;
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
            baseSouls: BASE_REWARDS.habit.souls,
            baseXp: BASE_REWARDS.habit.xp,
            hpStake: BASE_REWARDS.habit.hpStake,
        },
        {
            id: 'habit-2',
            title: 'Read for 15 minutes',
            type: 'habit' as TaskType,
            category: 'productivity' as TaskCategory,
            baseSouls: BASE_REWARDS.habit.souls,
            baseXp: BASE_REWARDS.habit.xp,
            hpStake: BASE_REWARDS.habit.hpStake,
        },
    ],
    dailies: [
        {
            id: 'daily-1',
            title: 'Morning Exercise',
            type: 'daily' as TaskType,
            category: 'fitness' as TaskCategory,
            baseSouls: BASE_REWARDS.daily.souls,
            baseXp: BASE_REWARDS.daily.xp,
            hpStake: BASE_REWARDS.daily.hpStake,
        },
        {
            id: 'daily-2',
            title: 'Review Goals',
            type: 'daily' as TaskType,
            category: 'productivity' as TaskCategory,
            baseSouls: BASE_REWARDS.daily.souls,
            baseXp: BASE_REWARDS.daily.xp,
            hpStake: BASE_REWARDS.daily.hpStake,
        },
    ],
    todos: [
        {
            id: 'todo-1',
            title: 'Complete project setup',
            type: 'todo' as TaskType,
            category: 'productivity' as TaskCategory,
            baseSouls: BASE_REWARDS.todo.souls,
            baseXp: BASE_REWARDS.todo.xp,
            hpStake: BASE_REWARDS.todo.hpStake,
        },
        {
            id: 'todo-2',
            title: 'Go for a run',
            type: 'todo' as TaskType,
            category: 'sports' as TaskCategory,
            baseSouls: BASE_REWARDS.todo.souls,
            baseXp: BASE_REWARDS.todo.xp,
            hpStake: BASE_REWARDS.todo.hpStake,
        },
    ],
};

const INITIAL_STATE = {
    hp: STARTING_HP,
    maxHp: STARTING_HP,
    xp: 0,
    xpToLevel: getXpToLevel(1),
    level: 1,
    soundEnabled: true,

    // Souls currency
    souls: 0,

    // Attributes
    attributes: { ...DEFAULT_ATTRIBUTES },

    // Flask (start with 1)
    flasks: 1,
    maxFlasks: FLASK_CONFIG.maxFlasks,

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

    // Death
    isDowned: false,
    deathCount: 0,
    soulsLostTotal: 0,

    ...INITIAL_TASKS,
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            gainXp: (amount: number) => {
                const state = get();
                // Downed players gain 50% less XP
                const effectiveAmount = state.isDowned ? Math.floor(amount * 0.5) : amount;
                let newXp = state.xp + effectiveAmount;
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

            gainSouls: (amount: number) => {
                set((state) => ({ souls: state.souls + amount }));
            },

            spendSouls: (amount: number) => {
                const state = get();
                if (state.souls < amount) return false;
                set({ souls: state.souls - amount });
                return true;
            },

            loseHp: (amount: number) => {
                const state = get();
                const newHp = Math.max(0, state.hp - amount);

                // Death: lose 50% of souls
                if (newHp === 0 && !state.isDowned) {
                    const soulsLost = Math.floor(state.souls * 0.5);
                    set({
                        hp: 0,
                        isDowned: true,
                        deathCount: state.deathCount + 1,
                        souls: state.souls - soulsLost,
                        soulsLostTotal: state.soulsLostTotal + soulsLost,
                    });
                } else {
                    set({ hp: newHp });
                }
            },

            stakeHp: (amount: number) => {
                const state = get();
                if (state.hp < amount || state.isDowned) return false;
                set({ hp: state.hp - amount });
                return true;
            },

            recoverHp: (amount: number) => {
                set((state) => ({
                    hp: Math.min(state.maxHp, state.hp + amount),
                }));
            },

            useFlask: () => {
                const state = get();
                if (state.flasks <= 0 || state.isDowned) return false;

                set({
                    flasks: state.flasks - 1,
                    hp: Math.min(state.maxHp, state.hp + FLASK_CONFIG.healAmount),
                });
                return true;
            },

            buyFlask: () => {
                const state = get();
                if (state.souls < FLASK_CONFIG.flaskCost) return false;
                if (state.flasks >= state.maxFlasks) return false;

                set({
                    souls: state.souls - FLASK_CONFIG.flaskCost,
                    flasks: state.flasks + 1,
                });
                return true;
            },

            refillFlasks: () => {
                set((state) => ({ flasks: state.maxFlasks }));
            },

            revive: () => {
                set((state) => ({
                    isDowned: false,
                    hp: Math.ceil(state.maxHp * 0.25),
                }));
            },

            incrementAttribute: (attr: AttributeType, amount = 0.1) => {
                set((state) => ({
                    attributes: {
                        ...state.attributes,
                        [attr]: state.attributes[attr] + amount,
                    },
                }));
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

            addTask: (type: TaskType, title: string, category: TaskCategory = 'productivity') => {
                const newTask: Task = {
                    id: `${type}-${Date.now()}`,
                    title,
                    type,
                    category,
                    baseSouls: BASE_REWARDS[type].souls,
                    baseXp: BASE_REWARDS[type].xp,
                    hpStake: BASE_REWARDS[type].hpStake,
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
                    const attribute = CATEGORY_ATTRIBUTE_MAP[task.category];
                    const attributeLevel = state.attributes[attribute];
                    const streakCount = state.categoryStreak[task.category];

                    // Calculate rewards with attribute bonus and streak penalty
                    const soulsReward = calculateSoulsReward(task.baseSouls, attributeLevel, streakCount);
                    const xpReward = calculateXpReward(task.baseXp, attributeLevel, streakCount);

                    // Apply rewards
                    state.gainSouls(soulsReward);
                    state.gainXp(xpReward);
                    state.recoverHp(Math.ceil(task.hpStake * 0.5));

                    // Increment attribute (small amount: 0.1 per task)
                    state.incrementAttribute(attribute, 0.1);

                    // Update category streak
                    state.updateCategoryStreak(task.category);
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
                    // No rewards on failure - just lose HP stake
                    state.loseHp(task.hpStake);
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
        }),
        {
            name: 'dopamine-strategy-game',
        }
    )
);
