import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskType } from '@/types';

interface GameState {
    hp: number;
    maxHp: number;
    xp: number;
    xpToLevel: number;
    level: number;
    soundEnabled: boolean;

    // Tasks
    habits: Task[];
    dailies: Task[];
    todos: Task[];

    // Actions
    gainXp: (amount: number) => void;
    loseHp: (amount: number) => void;
    toggleSound: () => void;
    resetStats: () => void;
    addTask: (type: TaskType, title: string) => void;
    completeTask: (type: TaskType, taskId: string) => void;
    deleteTask: (type: TaskType, taskId: string) => void;
}

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
    hp: 50,
    maxHp: 50,
    xp: 0,
    xpToLevel: 100,
    level: 1,
    soundEnabled: true,
    ...INITIAL_TASKS,
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            gainXp: (amount: number) => {
                const state = get();
                let newXp = state.xp + amount;
                let newLevel = state.level;
                let newXpToLevel = state.xpToLevel;

                // Level up logic
                while (newXp >= newXpToLevel) {
                    newXp -= newXpToLevel;
                    newLevel += 1;
                    newXpToLevel = Math.floor(newXpToLevel * 1.2);
                }

                set({
                    xp: newXp,
                    level: newLevel,
                    xpToLevel: newXpToLevel,
                });
            },

            loseHp: (amount: number) => {
                const state = get();
                const newHp = Math.max(0, state.hp - amount);
                set({ hp: newHp });
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
                    xpReward: type === 'habit' ? 5 : type === 'daily' ? 10 : 15,
                    hpPenalty: type === 'habit' ? 2 : type === 'daily' ? 5 : 3,
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
                set((state) => {
                    if (type === 'todo') {
                        return { todos: state.todos.filter((t) => t.id !== taskId) };
                    }
                    // Habits and dailies don't get removed on complete
                    return {};
                });
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
