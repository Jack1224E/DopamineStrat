import type { TaskCategory } from './categories';

/** Task type definitions */
export type TaskType = 'habit' | 'daily' | 'todo';

/** Difficulty levels */
export type TaskDifficulty = 'trivial' | 'easy' | 'medium' | 'hard';

/** Frequency for dailies */
export type TaskFrequency = 'daily' | 'weekly';

/** Checklist item for subtasks */
export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    notes?: string;                 // User notes/description
    type: TaskType;
    category: TaskCategory;         // productivity, sports, fitness, etc.
    difficulty: TaskDifficulty;     // trivial/easy/medium/hard

    // Type-specific fields
    dueDate?: string;               // ISO date string (todos only)
    frequency?: TaskFrequency;      // daily/weekly (dailies only)
    checklist?: ChecklistItem[];    // Subtasks (todos and dailies only)

    // Game mechanics
    baseSouls: number;              // Base Souls reward
    baseXp: number;                 // Base XP reward (mostly unused now)
    hpStake: number;                // HP cost on failure
    isCritical?: boolean;           // Critical habit fail = instant death
    completed?: boolean;
}

// Difficulty display info
export const DIFFICULTY_INFO: Record<TaskDifficulty, {
    label: string;
    emoji: string;
    color: string;
    soulsMultiplier: number;
}> = {
    trivial: { label: 'Trivial', emoji: '⭐', color: 'text-slate-400', soulsMultiplier: 0.5 },
    easy: { label: 'Easy', emoji: '⭐⭐', color: 'text-green-400', soulsMultiplier: 1 },
    medium: { label: 'Medium', emoji: '⭐⭐⭐', color: 'text-yellow-400', soulsMultiplier: 1.5 },
    hard: { label: 'Hard', emoji: '⭐⭐⭐⭐', color: 'text-red-400', soulsMultiplier: 2 },
};

export interface GameState {
    hp: number;
    maxHp: number;
    xp: number;
    xpToLevel: number;
    level: number;
    soundEnabled: boolean;
}

export type Theme = 'light' | 'cyberpunk';
