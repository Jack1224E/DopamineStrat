import type { TaskCategory } from './categories';

/** Task type definitions */
export type TaskType = 'habit' | 'daily' | 'todo';

export interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    category: TaskCategory;     // productivity, sports, fitness, etc.
    baseSouls: number;          // Base Souls reward
    baseXp: number;             // Base XP reward
    hpStake: number;            // HP cost to attempt
    isCritical?: boolean;       // Critical habit fail = instant death
    completed?: boolean;
}

export interface GameState {
    hp: number;
    maxHp: number;
    xp: number;
    xpToLevel: number;
    level: number;
    soundEnabled: boolean;
}

export type Theme = 'light' | 'cyberpunk';
