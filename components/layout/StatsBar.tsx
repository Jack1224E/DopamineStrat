'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import {
    Heart, Zap, RotateCcw, ChevronDown, ChevronUp, Trophy,
    Skull, Coins, ShoppingBag, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlaskCounter } from '@/components/game/FlaskCounter';
import { FlaskShop } from '@/components/game/FlaskShop';
import {
    CATEGORY_ATTRIBUTE_MAP,
    ATTRIBUTE_INFO,
    type TaskCategory,
    getAttributeLevel,
} from '@/types/categories';

// Layer 1: Enhanced health status with game-like descriptions
function getHealthStatus(hpPercent: number): {
    message: string;
    emoji: string;
    color: string;
    subtitle: string;
} {
    if (hpPercent >= 90) return {
        message: 'Invincible!',
        emoji: '👑',
        color: 'text-purple-400',
        subtitle: 'Nothing can stop you',
    };
    if (hpPercent >= 70) return {
        message: 'Feeling strong!',
        emoji: '💪',
        color: 'text-emerald-400',
        subtitle: 'Energy is overflowing',
    };
    if (hpPercent >= 50) return {
        message: 'Steady & Ready',
        emoji: '⚡',
        color: 'text-amber-400',
        subtitle: 'Keep pushing forward',
    };
    if (hpPercent >= 30) return {
        message: 'Need rest',
        emoji: '😓',
        color: 'text-orange-400',
        subtitle: 'Take it easy for a bit',
    };
    if (hpPercent >= 10) return {
        message: 'Danger Zone!',
        emoji: '⚠️',
        color: 'text-red-400',
        subtitle: 'Recovery needed',
    };
    return {
        message: 'CRITICAL!',
        emoji: '🆘',
        color: 'text-rose-400',
        subtitle: 'Immediate action required',
    };
}

interface StatsBarProps {
    onShopClick?: () => void;
}

export function StatsBar({ onShopClick }: StatsBarProps) {
    const {
        hp, baseMaxHp, xp, xpToLevel, level, souls,
        deathCount, isDowned, hollowLevel, categoryXp,
        getMaxHp, resetStats
    } = useGameStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [internalShowShop, setInternalShowShop] = useState(false);

    const maxHp = getMaxHp();
    const xpPercentage = useMemo(() => (xp / xpToLevel) * 100, [xp, xpToLevel]);
    const hpPercentage = useMemo(() => (hp / maxHp) * 100, [hp, maxHp]);
    const healthStatus = useMemo(() => getHealthStatus(hpPercentage), [hpPercentage]);

    const handleResetClick = () => {
        if (showResetConfirm) {
            resetStats();
            setShowResetConfirm(false);
        } else {
            setShowResetConfirm(true);
            setTimeout(() => setShowResetConfirm(false), 3000);
        }
    };

    const handleShopOpen = () => {
        if (onShopClick) {
            onShopClick();
        } else {
            setInternalShowShop(true);
        }
    };

    // Compute attributes from categoryXp
    const attributes = Object.entries(categoryXp).map(([cat, catXp]) => {
        const category = cat as TaskCategory;
        const attr = CATEGORY_ATTRIBUTE_MAP[category];
        const level = getAttributeLevel(catXp);
        return { category, attr, level, xp: catXp };
    });

    return (
        <>
            {!onShopClick && <FlaskShop isOpen={internalShowShop} onClose={() => setInternalShowShop(false)} />}

            <div
                className={cn(
                    "space-y-4 p-4 rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm",
                    "shadow-2xl shadow-black/20",
                    hpPercentage < 20 && "animate-pulse-slow border-red-500/30",
                    isDowned && "border-red-500/50 bg-gradient-to-br from-red-950/30 to-slate-900/90",
                    hollowLevel > 0 && !isDowned && "border-slate-500/50"
                )}
            >
                {/* Main Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={cn(
                                "relative w-16 h-16 rounded-xl border-2",
                                "bg-gradient-to-br from-primary/20 to-accent/20",
                                "flex items-center justify-center cursor-pointer",
                                "shadow-lg",
                                isDowned && "grayscale opacity-70",
                                hollowLevel > 0 && !isDowned && "opacity-80"
                            )}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <span className="text-3xl">{isDowned ? '💀' : hollowLevel >= 3 ? '🧟' : '🧙‍♂️'}</span>
                            {/* Level Badge */}
                            <div className="absolute -bottom-2 -right-2">
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold",
                                    "bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950",
                                    "flex items-center gap-1 shadow-lg"
                                )}>
                                    <Trophy className="w-3 h-3" />
                                    Lv {level}
                                </div>
                            </div>
                            {/* Hollow indicator */}
                            {hollowLevel > 0 && !isDowned && (
                                <div className="absolute -top-2 -left-2">
                                    <div className="bg-slate-900 rounded-full p-1.5 shadow-lg border border-slate-600">
                                        <span className="text-xs">🕳️</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <div className="space-y-1">
                            <h3 className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                {isDowned ? 'Fallen' : hollowLevel >= 3 ? 'Hollow' : 'Adventurer'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-medium", healthStatus.color)}>
                                    {isDowned ? 'YOU DIED' : healthStatus.message}
                                </span>
                                {hollowLevel > 0 && !isDowned && (
                                    <span className="text-xs text-slate-500">
                                        (Hollow x{hollowLevel})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Souls Counter + Shop Button */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30">
                            <Coins className="w-5 h-5 text-cyan-400" />
                            <span className="text-lg font-bold text-cyan-300">{souls}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleShopOpen}
                            className="h-10 w-10 rounded-xl border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                        >
                            <ShoppingBag className="w-5 h-5 text-amber-400" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="shrink-0 h-10 w-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
                        >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Stats Bars */}
                <div className="space-y-3">
                    {/* HP Bar with Hollow Indicator */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart className={cn(
                                    "w-4 h-4",
                                    hpPercentage > 70 ? "text-red-400" :
                                        hpPercentage > 30 ? "text-orange-400" :
                                            "text-rose-400 animate-pulse"
                                )} />
                                <span className="text-sm font-medium text-slate-300">Health</span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {hp}/{maxHp}
                                    {hollowLevel > 0 && (
                                        <span className="text-slate-500 ml-1">
                                            (max: {baseMaxHp})
                                        </span>
                                    )}
                                </span>
                            </div>
                            {hollowLevel > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700/50 text-xs text-slate-400">
                                    <AlertTriangle className="w-3 h-3" />
                                    -{hollowLevel * 10}%
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <Progress
                                value={hpPercentage}
                                className={cn(
                                    "h-3 bg-slate-800 border border-slate-700",
                                    "[&>div]:transition-all [&>div]:duration-500",
                                    hpPercentage > 70 ? "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-400" :
                                        hpPercentage > 30 ? "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-400" :
                                            "[&>div]:bg-gradient-to-r [&>div]:from-rose-600 [&>div]:to-red-500 [&>div]:animate-pulse"
                                )}
                            />
                            {/* Hollow cap indicator */}
                            {hollowLevel > 0 && (
                                <div
                                    className="absolute top-0 bottom-0 right-0 bg-slate-600/50 border-l border-slate-500"
                                    style={{ width: `${hollowLevel * 10}%` }}
                                />
                            )}
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-medium text-slate-300">Experience</span>
                                <span className="text-xs text-slate-400 font-mono">{xp}/{xpToLevel}</span>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                                {Math.round(xpPercentage)}%
                            </span>
                        </div>
                        <Progress
                            value={xpPercentage}
                            className="h-3 bg-slate-800 border border-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400"
                        />
                    </div>
                </div>

                {/* Flask Counter + Death Counter */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Flasks:</span>
                        <FlaskCounter />
                    </div>

                    {deathCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
                            <Skull className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-mono text-slate-300">{deathCount}</span>
                        </div>
                    )}
                </div>

                {/* Expandable Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-slate-700 space-y-4">
                                {/* Attributes Grid (computed from categoryXp) */}
                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                                        Attributes <span className="text-xs text-slate-500">(100 XP = 1 level)</span>
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {attributes.map(({ attr, level, xp }) => {
                                            const info = ATTRIBUTE_INFO[attr];
                                            const nextLevelXp = (level + 1) * 100;
                                            const progress = (xp % 100);
                                            return (
                                                <div key={attr} className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700">
                                                    <div className="text-lg">{info.emoji}</div>
                                                    <div className="text-xs text-slate-400">{info.shortLabel}</div>
                                                    <div className={cn("text-sm font-bold", info.color)}>
                                                        Lv {level}
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-700 rounded-full mt-1">
                                                        <div
                                                            className="h-full bg-slate-500 rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        {xp}/{nextLevelXp}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reset Button */}
                                <div className="flex justify-center">
                                    <Button
                                        variant={showResetConfirm ? "destructive" : "outline"}
                                        size="lg"
                                        onClick={handleResetClick}
                                        className={cn(
                                            "w-full transition-all duration-300",
                                            showResetConfirm && "animate-pulse",
                                            "border-slate-700 hover:border-slate-600"
                                        )}
                                    >
                                        <RotateCcw className={cn("w-4 h-4 mr-2", showResetConfirm && "animate-spin")} />
                                        {showResetConfirm ? "Confirm Reset?" : "Reset Journey"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
