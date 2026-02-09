/** Economy Types for Souls-like System */

// Task difficulty tiers for boss-like challenges
export type TaskTier = 'S' | 'A' | 'B' | 'C';

// Task with stakes
export interface StakedTask {
    id: string;
    title: string;
    description?: string;
    type: 'habit' | 'daily' | 'todo';
    tier: TaskTier;
    hpStake: number;        // HP cost to attempt
    xpReward: number;       // XP gained on success
    hpRecovery: number;     // HP recovered on success
    timeLimit?: number;     // Optional time limit in seconds
    isStaked?: boolean;     // Has player committed HP?
    attempts?: number;      // Track attempts for learning feedback
    bestAttempt?: string;   // Best result description
}

// Stakes configuration by task type
export const STAKE_CONFIG = {
    habit: { hpStake: 1, xpReward: 5, hpRecovery: 1 },
    daily: { hpStake: 3, xpReward: 15, hpRecovery: 3 },
    todo: {
        C: { hpStake: 3, xpReward: 20, hpRecovery: 3 },
        B: { hpStake: 5, xpReward: 40, hpRecovery: 5 },
        A: { hpStake: 8, xpReward: 80, hpRecovery: 8 },
        S: { hpStake: 15, xpReward: 150, hpRecovery: 0 }, // S-tier: instant death on fail
    }
} as const;

// Flask (Estus) type
export interface Flask {
    current: number;
    max: number;
    healAmount: number;
}

// Get flask config by level
export function getFlaskConfig(level: number): Flask {
    if (level >= 10) return { current: 3, max: 3, healAmount: 15 };
    if (level >= 5) return { current: 2, max: 2, healAmount: 12 };
    return { current: 1, max: 1, healAmount: 10 };
}

// Get max HP by level (starts low for "Glass Cannon")
export function getMaxHpByLevel(level: number): number {
    // MECH-03: Glass Cannon Start - starting HP low, 2-3 mistakes = death
    const BASE_HP = 15; // Low starting HP
    return BASE_HP + (level - 1) * 5;
}

// Calculate XP required for next level
export function getXpToLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Consumable item types (GEAR-02 to GEAR-04)
export type ConsumableType = 'estus_flask' | 'green_blossom' | 'gold_pine_resin';

export interface Consumable {
    id: ConsumableType;
    name: string;
    description: string;
    cost: number;       // XP cost to buy
    quantity: number;   // How many owned
    maxQuantity: number;
    effect: string;
}

// Equipment types (GEAR-05 to GEAR-07)
export type EquipmentType = 'greatshield' | 'ring_of_favor' | 'moonlight_greatsword';

export interface Equipment {
    id: EquipmentType;
    name: string;
    description: string;
    cost: number;       // XP cost to buy
    owned: boolean;
    equipped: boolean;
    effect: string;
}

// Shop inventory
export const SHOP_ITEMS = {
    consumables: {
        estus_flask: {
            id: 'estus_flask' as ConsumableType,
            name: 'Estus Flask',
            description: 'Restores HP. Your lifeline in tough times.',
            cost: 50,
            quantity: 0,
            maxQuantity: 5,
            effect: 'Restores 10-15 HP based on level',
        },
        green_blossom: {
            id: 'green_blossom' as ConsumableType,
            name: 'Green Blossom',
            description: 'Time Dilation. Extends a deadline by 5 minutes.',
            cost: 75,
            quantity: 0,
            maxQuantity: 3,
            effect: '+5 minutes on any timed task',
        },
        gold_pine_resin: {
            id: 'gold_pine_resin' as ConsumableType,
            name: 'Gold Pine Resin',
            description: 'Focus Mode. AI breaks task into 3 smaller chunks.',
            cost: 100,
            quantity: 0,
            maxQuantity: 2,
            effect: 'Splits 1 task into 3 sub-tasks',
        },
    },
    equipment: {
        greatshield: {
            id: 'greatshield' as EquipmentType,
            name: 'Greatshield',
            description: 'Buffer Zone. First missed deadline costs 0 HP.',
            cost: 200,
            owned: false,
            equipped: false,
            effect: 'First daily fail = no HP loss',
        },
        ring_of_favor: {
            id: 'ring_of_favor' as EquipmentType,
            name: 'Ring of Favor',
            description: 'Stamina Up. Increases max daily task attempts.',
            cost: 300,
            owned: false,
            equipped: false,
            effect: '+3 daily task attempts',
        },
        moonlight_greatsword: {
            id: 'moonlight_greatsword' as EquipmentType,
            name: 'Moonlight Greatsword',
            description: 'Hard Mode. Unlocks S-Tier tasks (instant death on fail).',
            cost: 500,
            owned: false,
            equipped: false,
            effect: 'Unlocks S-Tier challenges',
        },
    },
} as const;

// Downed state (when HP = 0)
export interface DownedState {
    isDowned: boolean;
    xpLostOnDeath: number;      // MECH-01: XP lost when downed
    deathCount: number;         // Badge of honor
    recoveryTaskId?: string;    // Current recovery task
}
