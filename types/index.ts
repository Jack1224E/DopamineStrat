/** Task type definitions */
export type TaskType = 'habit' | 'daily' | 'todo';

export interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    xpReward: number;
    hpPenalty: number;
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
