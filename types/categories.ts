/** Task Categories and User Attributes */

// 6 Task Categories
export type TaskCategory =
    | 'productivity'  // → Intelligence
    | 'sports'        // → Endurance
    | 'fitness'       // → Strength
    | 'self_care'     // → Vitality
    | 'creativity'    // → Insight
    | 'social';       // → Charisma

// 6 User Attributes (map 1:1 with categories)
export type AttributeType =
    | 'intelligence'
    | 'endurance'
    | 'strength'
    | 'vitality'
    | 'insight'
    | 'charisma';

// Category → Attribute mapping
export const CATEGORY_ATTRIBUTE_MAP: Record<TaskCategory, AttributeType> = {
    productivity: 'intelligence',
    sports: 'endurance',
    fitness: 'strength',
    self_care: 'vitality',
    creativity: 'insight',
    social: 'charisma',
};

// Category display info
export const CATEGORY_INFO: Record<TaskCategory, {
    label: string;
    emoji: string;
    color: string;
    description: string;
}> = {
    productivity: {
        label: 'Productivity',
        emoji: '💼',
        color: 'text-blue-400',
        description: 'Work, study, and getting things done',
    },
    sports: {
        label: 'Sports',
        emoji: '🏃',
        color: 'text-green-400',
        description: 'Athletic activities and outdoor games',
    },
    fitness: {
        label: 'Fitness',
        emoji: '💪',
        color: 'text-red-400',
        description: 'Workouts, gym, and physical training',
    },
    self_care: {
        label: 'Self-Care',
        emoji: '🧘',
        color: 'text-pink-400',
        description: 'Health, rest, and personal wellness',
    },
    creativity: {
        label: 'Creativity',
        emoji: '🎨',
        color: 'text-purple-400',
        description: 'Art, music, writing, and creative pursuits',
    },
    social: {
        label: 'Social',
        emoji: '👥',
        color: 'text-yellow-400',
        description: 'Friends, family, and community',
    },
};

// Attribute display info
export const ATTRIBUTE_INFO: Record<AttributeType, {
    label: string;
    shortLabel: string;
    emoji: string;
    color: string;
}> = {
    intelligence: {
        label: 'Intelligence',
        shortLabel: 'INT',
        emoji: '🧠',
        color: 'text-blue-400',
    },
    endurance: {
        label: 'Endurance',
        shortLabel: 'END',
        emoji: '🏃',
        color: 'text-green-400',
    },
    strength: {
        label: 'Strength',
        shortLabel: 'STR',
        emoji: '💪',
        color: 'text-red-400',
    },
    vitality: {
        label: 'Vitality',
        shortLabel: 'VIT',
        emoji: '❤️',
        color: 'text-pink-400',
    },
    insight: {
        label: 'Insight',
        shortLabel: 'INS',
        emoji: '✨',
        color: 'text-purple-400',
    },
    charisma: {
        label: 'Charisma',
        shortLabel: 'CHA',
        emoji: '🌟',
        color: 'text-yellow-400',
    },
};

// Default attributes (all start at 1)
export const DEFAULT_ATTRIBUTES: Record<AttributeType, number> = {
    intelligence: 1,
    endurance: 1,
    strength: 1,
    vitality: 1,
    insight: 1,
    charisma: 1,
};

// Calculate bonus multiplier from attribute level
// Formula: 1 + (level * 0.05) = 5% bonus per level
export function getAttributeBonus(level: number): number {
    return 1 + (level * 0.05);
}

// Calculate Souls reward for a task
export function calculateSoulsReward(
    baseSouls: number,
    attributeLevel: number,
    streakCount: number
): number {
    const attributeBonus = getAttributeBonus(attributeLevel);

    // Diminishing returns after 3+ same-category tasks
    const streakPenalty = streakCount >= 3
        ? Math.max(0.5, 1 - (streakCount - 2) * 0.15) // 15% reduction per extra
        : 1;

    return Math.floor(baseSouls * attributeBonus * streakPenalty);
}

// Calculate XP reward for a task
export function calculateXpReward(
    baseXp: number,
    attributeLevel: number,
    streakCount: number
): number {
    const attributeBonus = getAttributeBonus(attributeLevel);

    // Same diminishing returns
    const streakPenalty = streakCount >= 3
        ? Math.max(0.5, 1 - (streakCount - 2) * 0.15)
        : 1;

    return Math.floor(baseXp * attributeBonus * streakPenalty);
}

// Base rewards by task type
export const BASE_REWARDS = {
    habit: { souls: 5, xp: 2, hpStake: 1 },
    daily: { souls: 15, xp: 5, hpStake: 3 },
    todo: { souls: 25, xp: 10, hpStake: 5 },
} as const;

// Flask constants
export const FLASK_CONFIG = {
    maxFlasks: 1,           // Max flasks player can have
    healAmount: 25,         // HP healed per flask
    flaskCost: 100,         // Souls cost to buy a flask
} as const;
