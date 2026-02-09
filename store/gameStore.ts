import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType } from '@/types';
import {
    getMaxHpByLevel,
    getXpToLevel,
    getFlaskConfig,
    type Flask,
    type ConsumableType,
    type EquipmentType,
    SHOP_ITEMS,
} from '@/types/economy';

interface Inventory {
    estus_flask: number;
    green_blossom: number;
    gold_pine_resin: number;
}

interface EquippedGear {
    greatshield: boolean;
    ring_of_favor: boolean;
    moonlight_greatsword: boolean;
}

interface GameState {
    // Core stats
    hp: number;
    maxHp: number;
    xp: number;
    unbankedXp: number;     // MECH-01: Volatile XP lost on death
    xpToLevel: number;
    level: number;
    soundEnabled: boolean;

    // Flask system (MECH-05 / GEAR-02)
    flasks: Flask;

    // Downed state (MECH-01)
    isDowned: boolean;
    deathCount: number;
    xpLostTotal: number;

    // Gear system (GEAR-05 to GEAR-07)
    inventory: Inventory;
    equipment: EquippedGear;
    ownedEquipment: EquippedGear;

    // Daily protection (Greatshield effect)
    usedBufferToday: boolean;

    // Tasks
    habits: Task[];
    dailies: Task[];
    todos: Task[];

    // Actions
    gainXp: (amount: number) => void;
    bankXp: () => void;                         // Convert unbanked to safe XP
    loseHp: (amount: number) => void;
    stakeHp: (amount: number) => boolean;       // Pay HP upfront for task
    recoverHp: (amount: number) => void;        // Recover HP on task success
    useFlask: () => boolean;                    // Use Estus Flask
    refillFlasks: () => void;                   // Daily reset
    revive: () => void;                         // Recovery from downed state
    toggleSound: () => void;
    resetStats: () => void;

    // Task actions
    addTask: (type: TaskType, title: string) => void;
    completeTask: (type: TaskType, taskId: string) => void;
    failTask: (type: TaskType, taskId: string) => void;
    deleteTask: (type: TaskType, taskId: string) => void;

    // Shop actions
    buyConsumable: (item: ConsumableType) => boolean;
    useConsumable: (item: ConsumableType) => boolean;
    buyEquipment: (item: EquipmentType) => boolean;
    equipItem: (item: EquipmentType) => void;
}

const INITIAL_LEVEL = 1;

const INITIAL_TASKS = {
    habits: [
        {
            id: 'habit-1',
            title: 'Drink Water',
            type: 'habit' as TaskType,
            xpReward: 5,
            hpPenalty: 2,
        },
        {
            id: 'habit-2',
            title: 'Read for 15 minutes',
            type: 'habit' as TaskType,
            xpReward: 10,
            hpPenalty: 3,
        },
    ],
    dailies: [
        {
            id: 'daily-1',
            title: 'Morning Exercise',
            type: 'daily' as TaskType,
            xpReward: 15,
            hpPenalty: 5,
        },
        {
            id: 'daily-2',
            title: 'Review Goals',
            type: 'daily' as TaskType,
            xpReward: 8,
            hpPenalty: 3,
        },
    ],
    todos: [
        {
            id: 'todo-1',
            title: 'Complete project setup',
            type: 'todo' as TaskType,
            xpReward: 25,
            hpPenalty: 8,
        },
        {
            id: 'todo-2',
            title: 'Design database schema',
            type: 'todo' as TaskType,
            xpReward: 20,
            hpPenalty: 5,
        },
    ],
};

const INITIAL_STATE = {
    // MECH-03: Glass Cannon Start - low starting HP
    hp: getMaxHpByLevel(INITIAL_LEVEL),
    maxHp: getMaxHpByLevel(INITIAL_LEVEL),
    xp: 0,
    unbankedXp: 0,
    xpToLevel: getXpToLevel(INITIAL_LEVEL),
    level: INITIAL_LEVEL,
    soundEnabled: true,

    // Flask system
    flasks: getFlaskConfig(INITIAL_LEVEL),

    // Downed state
    isDowned: false,
    deathCount: 0,
    xpLostTotal: 0,

    // Inventory
    inventory: {
        estus_flask: 0,
        green_blossom: 0,
        gold_pine_resin: 0,
    },
    equipment: {
        greatshield: false,
        ring_of_favor: false,
        moonlight_greatsword: false,
    },
    ownedEquipment: {
        greatshield: false,
        ring_of_favor: false,
        moonlight_greatsword: false,
    },
    usedBufferToday: false,

    ...INITIAL_TASKS,
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            gainXp: (amount: number) => {
                const state = get();

                // MECH-01: XP goes to unbanked first (volatile)
                // When downed, gain only 50%
                const effectiveAmount = state.isDowned ? Math.floor(amount * 0.5) : amount;
                let newUnbankedXp = state.unbankedXp + effectiveAmount;
                let newXp = state.xp;
                let newLevel = state.level;
                let newXpToLevel = state.xpToLevel;
                let newMaxHp = state.maxHp;
                let newFlasks = state.flasks;

                // Auto-bank XP when it exceeds threshold
                const totalXp = newXp + newUnbankedXp;

                // Level up logic
                while (totalXp >= newXpToLevel) {
                    // Bank all XP on level up
                    newXp = totalXp - newXpToLevel;
                    newUnbankedXp = 0;
                    newLevel += 1;
                    newXpToLevel = getXpToLevel(newLevel);
                    newMaxHp = getMaxHpByLevel(newLevel);
                    newFlasks = getFlaskConfig(newLevel);
                }

                set({
                    xp: newXp,
                    unbankedXp: newUnbankedXp,
                    level: newLevel,
                    xpToLevel: newXpToLevel,
                    maxHp: newMaxHp,
                    flasks: { ...newFlasks, current: state.flasks.current },
                });
            },

            bankXp: () => {
                // Convert unbanked XP to safe XP (e.g., at a bonfire)
                set((state) => ({
                    xp: state.xp + state.unbankedXp,
                    unbankedXp: 0,
                }));
            },

            loseHp: (amount: number) => {
                const state = get();

                // GEAR-05: Greatshield - first fail of day costs 0 HP
                if (state.equipment.greatshield && !state.usedBufferToday) {
                    set({ usedBufferToday: true });
                    return; // No HP loss!
                }

                const newHp = Math.max(0, state.hp - amount);

                // MECH-01: Death triggers XP loss
                if (newHp === 0 && !state.isDowned) {
                    const xpLost = Math.floor(state.unbankedXp * 0.5); // Lose 50% of unbanked XP
                    set({
                        hp: 0,
                        isDowned: true,
                        deathCount: state.deathCount + 1,
                        unbankedXp: state.unbankedXp - xpLost,
                        xpLostTotal: state.xpLostTotal + xpLost,
                    });
                } else {
                    set({ hp: newHp });
                }
            },

            stakeHp: (amount: number) => {
                // SOULS-03: Fog Gate Commitment - pay HP upfront
                const state = get();
                if (state.hp < amount || state.isDowned) return false;

                set({ hp: state.hp - amount });
                return true;
            },

            recoverHp: (amount: number) => {
                // Recover HP on task success
                set((state) => ({
                    hp: Math.min(state.maxHp, state.hp + amount),
                }));
            },

            useFlask: () => {
                const state = get();
                if (state.flasks.current <= 0 || state.isDowned) return false;

                set({
                    flasks: { ...state.flasks, current: state.flasks.current - 1 },
                    hp: Math.min(state.maxHp, state.hp + state.flasks.healAmount),
                });
                return true;
            },

            refillFlasks: () => {
                set((state) => ({
                    flasks: { ...state.flasks, current: state.flasks.max },
                    usedBufferToday: false, // Reset greatshield
                }));
            },

            revive: () => {
                // Recovery from downed state
                set((state) => ({
                    isDowned: false,
                    hp: Math.ceil(state.maxHp * 0.25), // Revive at 25% HP
                }));
            },

            toggleSound: () => {
                set((state) => ({ soundEnabled: !state.soundEnabled }));
            },

            resetStats: () => {
                set(INITIAL_STATE);
            },

            addTask: (type: TaskType, title: string) => {
                const newTask: Task = {
                    id: `${type}-${Date.now()}`,
                    title,
                    type,
                    xpReward: type === 'habit' ? 5 : type === 'daily' ? 15 : 25,
                    hpPenalty: type === 'habit' ? 2 : type === 'daily' ? 5 : 8,
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
                    // Gain XP and recover HP on success
                    state.gainXp(task.xpReward);
                    state.recoverHp(Math.ceil(task.hpPenalty * 0.5)); // Recover half the stake
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
                    // SOULS-04 / MECH-04: No partial credit - lose stake, gain nothing
                    state.loseHp(task.hpPenalty);
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

            buyConsumable: (item: ConsumableType) => {
                const state = get();
                const shopItem = SHOP_ITEMS.consumables[item];
                const totalXp = state.xp + state.unbankedXp;

                if (totalXp < shopItem.cost) return false;
                if (state.inventory[item] >= shopItem.maxQuantity) return false;

                // Spend from unbanked first, then banked
                let remaining = shopItem.cost;
                let newUnbanked = state.unbankedXp;
                let newXp = state.xp;

                if (newUnbanked >= remaining) {
                    newUnbanked -= remaining;
                } else {
                    remaining -= newUnbanked;
                    newUnbanked = 0;
                    newXp -= remaining;
                }

                set({
                    xp: newXp,
                    unbankedXp: newUnbanked,
                    inventory: {
                        ...state.inventory,
                        [item]: state.inventory[item] + 1,
                    },
                });
                return true;
            },

            useConsumable: (item: ConsumableType) => {
                const state = get();
                if (state.inventory[item] <= 0) return false;

                // Apply consumable effect
                if (item === 'estus_flask') {
                    const healAmount = getFlaskConfig(state.level).healAmount;
                    set({
                        hp: Math.min(state.maxHp, state.hp + healAmount),
                        inventory: {
                            ...state.inventory,
                            estus_flask: state.inventory.estus_flask - 1,
                        },
                    });
                } else {
                    // green_blossom and gold_pine_resin effects handled by UI
                    set({
                        inventory: {
                            ...state.inventory,
                            [item]: state.inventory[item] - 1,
                        },
                    });
                }
                return true;
            },

            buyEquipment: (item: EquipmentType) => {
                const state = get();
                const shopItem = SHOP_ITEMS.equipment[item];
                const totalXp = state.xp + state.unbankedXp;

                if (totalXp < shopItem.cost) return false;
                if (state.ownedEquipment[item]) return false;

                // Spend from unbanked first
                let remaining = shopItem.cost;
                let newUnbanked = state.unbankedXp;
                let newXp = state.xp;

                if (newUnbanked >= remaining) {
                    newUnbanked -= remaining;
                } else {
                    remaining -= newUnbanked;
                    newUnbanked = 0;
                    newXp -= remaining;
                }

                set({
                    xp: newXp,
                    unbankedXp: newUnbanked,
                    ownedEquipment: {
                        ...state.ownedEquipment,
                        [item]: true,
                    },
                });
                return true;
            },

            equipItem: (item: EquipmentType) => {
                const state = get();
                if (!state.ownedEquipment[item]) return;

                set({
                    equipment: {
                        ...state.equipment,
                        [item]: !state.equipment[item],
                    },
                });
            },
        }),
        {
            name: 'dopamine-strategy-game',
        }
    )
);
