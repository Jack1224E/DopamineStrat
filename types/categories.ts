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

// Default attributes (all start at 0 - computed from categoryXp)
export const DEFAULT_CATEGORY_XP: Record<TaskCategory, number> = {
    productivity: 0,
    sports: 0,
    fitness: 0,
    self_care: 0,
    creativity: 0,
    social: 0,
};

// Compute attribute level from category XP (100 XP = 1 level)
export const XP_PER_ATTRIBUTE_LEVEL = 100;

export function getAttributeLevel(categoryXp: number): number {
    return Math.floor(categoryXp / XP_PER_ATTRIBUTE_LEVEL);
}

// Calculate XP multiplier from attribute level
// Formula: 1 + level (level 0 = 1x, level 1 = 2x, level 2 = 3x, etc.)
export function getXpMultiplier(attributeLevel: number): number {
    return 1 + attributeLevel;
}

// Calculate bonus multiplier from attribute level (for Souls)
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

// Calculate XP reward for a task (with new 10% multiplier)
export function calculateXpReward(
    baseXp: number,
    attributeLevel: number,
    streakCount: number
): number {
    const xpMultiplier = getXpMultiplier(attributeLevel);

    // Same diminishing returns
    const streakPenalty = streakCount >= 3
        ? Math.max(0.5, 1 - (streakCount - 2) * 0.15)
        : 1;

    return Math.floor(baseXp * xpMultiplier * streakPenalty);
}

// Base rewards by task type
export const BASE_REWARDS = {
    habit: { souls: 5, xp: 2, hpStake: 1 },
    daily: { souls: 15, xp: 5, hpStake: 3 },
    todo: { souls: 25, xp: 10, hpStake: 5 },
} as const;

// Hollowing config
export const HOLLOW_CONFIG = {
    maxHollowLevel: 5,           // Max hollow levels
    hpReductionPerLevel: 0.1,    // 10% HP reduction per level
    minHpPercent: 0.5,           // Minimum 50% HP at max hollow
} as const;

// Shop items
export type ShopItemId =
    | 'estus_flask'
    | 'human_effigy'
    | 'ring_of_protection'
    | 'golden_pine_resin';

export interface ShopItem {
    id: ShopItemId;
    name: string;
    description: string;
    cost: number;
    effect: string;
    maxQuantity: number;
}

export const SHOP_ITEMS: Record<ShopItemId, ShopItem> = {
    estus_flask: {
        id: 'estus_flask',
        name: 'Estus Flask',
        description: 'A warm, golden liquid that restores HP',
        cost: 100,
        effect: 'Heal 25 HP',
        maxQuantity: 3,
    },
    human_effigy: {
        id: 'human_effigy',
        name: 'Human Effigy',
        description: 'Restores your humanity and reverses hollowing',
        cost: 150,
        effect: 'Remove 1 hollow level, restore max HP',
        maxQuantity: 5,
    },
    ring_of_protection: {
        id: 'ring_of_protection',
        name: 'Ring of Protection',
        description: 'Reduces HP loss from failed tasks',
        cost: 200,
        effect: 'Next task failure costs 50% less HP',
        maxQuantity: 3,
    },
    golden_pine_resin: {
        id: 'golden_pine_resin',
        name: 'Golden Pine Resin',
        description: 'Enhances your next task completion',
        cost: 75,
        effect: 'Next completed task grants 2x Souls',
        maxQuantity: 5,
    },
};

// Flask constants (simplified)
export const FLASK_CONFIG = {
    maxFlasks: 1,           // Start with 1 slot, upgradable later
    healAmount: 25,         // HP healed per flask
    flaskCost: 100,         // Souls cost to buy a flask
} as const;

