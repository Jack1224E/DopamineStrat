'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import {
    Heart, Zap, RotateCcw, ChevronDown, ChevronUp, Trophy,
    Skull, Coins, ShoppingBag, AlertTriangle, X
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

// Health status descriptor
function getHealthStatus(hpPercent: number): {
    message: string;
    emoji: string;
    color: string;
    subtitle: string;
} {
    if (hpPercent >= 90) return {
        message: 'Invincible!',
        emoji: '👑',
        color: 'text-green-400 font-bold',
        subtitle: 'Nothing can stop you',
    };
    if (hpPercent >= 70) return {
        message: 'Feeling strong!',
        emoji: '💪',
        color: 'text-green-400 font-bold',
        subtitle: 'Energy is overflowing',
    };
    if (hpPercent >= 50) return {
        message: 'Steady & Ready',
        emoji: '⚡',
        color: 'text-green-300 font-bold',
        subtitle: 'Keep pushing forward',
    };
    if (hpPercent >= 30) return {
        message: 'Need rest',
        emoji: '😓',
        color: 'text-yellow-400 font-bold',
        subtitle: 'Take it easy for a bit',
    };
    if (hpPercent >= 10) return {
        message: 'Danger Zone!',
        emoji: '⚠️',
        color: 'text-red-300 font-bold',
        subtitle: 'Recovery needed',
    };
    return {
        message: 'CRITICAL!',
        emoji: '🆘',
        color: 'text-rose-300 font-bold underline',
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

    // Persist compact/expanded preference
    const [isExpanded, setIsExpanded] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [internalShowShop, setInternalShowShop] = useState(false);

    // Load preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('statsbar-expanded');
        if (saved === 'true') setIsExpanded(true);
    }, []);

    // Save preference
    useEffect(() => {
        localStorage.setItem('statsbar-expanded', String(isExpanded));
    }, [isExpanded]);

    const maxHp = getMaxHp();
    const xpPercentage = useMemo(() => (xp / xpToLevel) * 100, [xp, xpToLevel]);
    const hpPercentage = useMemo(() => (hp / maxHp) * 100, [hp, maxHp]);
    const healthStatus = useMemo(() => getHealthStatus(hpPercentage), [hpPercentage]);

    const handleShopOpen = () => {
        if (onShopClick) {
            onShopClick();
        } else {
            setInternalShowShop(true);
        }
    };

    const handleReset = () => {
        resetStats();
        setShowResetModal(false);
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
            {!onShopClick && <FlaskShop isOpen={internalShowShop} onClose={() => { setInternalShowShop(false); }} />}

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => { setShowResetModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Reset Journey?</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">This will permanently reset:</p>
                            <ul className="text-sm text-slate-300 space-y-1 mb-6 ml-4">
                                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> HP, XP, and Level</li>
                                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> All Souls</li>
                                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Attributes & Category XP</li>
                                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> Inventory & Flasks</li>
                                <li className="flex items-center gap-2"><span className="text-red-400">✕</span> All tasks & history</li>
                            </ul>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-700 hover:bg-slate-800"
                                    onClick={() => setShowResetModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 bg-red-600 hover:bg-red-500"
                                    onClick={handleReset}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reset Everything
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={cn(
                    "rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm",
                    "shadow-2xl shadow-black/20 transition-colors duration-300",
                    hpPercentage < 20 && "border-red-500/30",
                    isDowned && "border-red-500/50 bg-gradient-to-br from-red-950/30 to-slate-900/90",
                    hollowLevel > 0 && !isDowned && "border-slate-500/50",
                    !isDowned && hpPercentage >= 20 && hollowLevel === 0 && "border-slate-700/50"
                )}
            >
                {/* ═══════════════════════════════════════════════ */}
                {/* COMPACT MODE — single thin row                 */}
                {/* ═══════════════════════════════════════════════ */}
                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Character avatar (small in compact) */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xl">{isDowned ? '💀' : hollowLevel >= 3 ? '🧟' : '🧙‍♂️'}</span>
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold",
                            "bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950",
                            "flex items-center gap-1"
                        )}>
                            <Trophy className="w-3 h-3" />
                            {level}
                        </div>
                    </div>

                    {/* HP mini bar */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 max-w-[160px]">
                        <Heart className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            hpPercentage > 70 ? "text-red-400" :
                                hpPercentage > 30 ? "text-orange-400" :
                                    "text-rose-400 animate-pulse"
                        )} />
                        <div className="flex-1 min-w-0">
                            <Progress
                                value={hpPercentage}
                                className={cn(
                                    "h-2 bg-slate-800 border border-slate-700",
                                    "[&>div]:transition-all [&>div]:duration-500",
                                    hpPercentage > 70 ? "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-400" :
                                        hpPercentage > 30 ? "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-400" :
                                            "[&>div]:bg-gradient-to-r [&>div]:from-rose-600 [&>div]:to-red-500"
                                )}
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{hp}/{maxHp}</span>
                    </div>

                    {/* XP mini bar */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 max-w-[160px]">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <Progress
                                value={xpPercentage}
                                className="h-2 bg-slate-800 border border-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400"
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{Math.round(xpPercentage)}%</span>
                    </div>

                    {/* Souls */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-900/30 border border-cyan-500/20 shrink-0">
                        <Coins className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-300">{souls}</span>
                    </div>

                    {/* Flasks (compact) */}
                    <div className="shrink-0">
                        <FlaskCounter />
                    </div>

                    {/* Shop */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShopOpen}
                        className="h-8 w-8 rounded-lg border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 shrink-0"
                    >
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                    </Button>

                    {/* Death counter (compact) */}
                    {deathCount > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700 shrink-0">
                            <Skull className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs font-mono text-slate-300">{deathCount}</span>
                        </div>
                    )}

                    {/* Expand/Collapse toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setIsExpanded(!isExpanded); }}
                        className="shrink-0 h-8 w-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-200 hover:text-white"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>

                {/* ═══════════════════════════════════════════════ */}
                {/* EXPANDED MODE — full details when toggled      */}
                {/* ═══════════════════════════════════════════════ */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50">
                                {/* Character + Status (detailed) */}
                                <div className="flex items-center gap-3 pt-4">
                                    <motion.div
                                        className={cn(
                                            "relative w-14 h-14 rounded-xl border-2",
                                            "bg-gradient-to-br from-primary/20 to-accent/20",
                                            "flex items-center justify-center",
                                            "shadow-lg",
                                            isDowned && "grayscale opacity-70",
                                            hollowLevel > 0 && !isDowned && "opacity-80"
                                        )}
                                    >
                                        <span className="text-2xl">{isDowned ? '💀' : hollowLevel >= 3 ? '🧟' : '🧙‍♂️'}</span>
                                        {hollowLevel > 0 && !isDowned && (
                                            <div className="absolute -top-1 -left-1">
                                                <div className="bg-slate-900 rounded-full p-1 shadow-lg border border-slate-600">
                                                    <span className="text-[10px]">🕳️</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="space-y-0.5">
                                        <h3 className="font-bold text-base bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                            {isDowned ? 'Fallen' : hollowLevel >= 3 ? 'Hollow' : 'Adventurer'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-sm transition-colors duration-300", healthStatus.color)}>
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

                                {/* Detailed HP Bar */}
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
                                                        "[&>div]:bg-gradient-to-r [&>div]:from-rose-600 [&>div]:to-red-500"
                                            )}
                                        />
                                        {hollowLevel > 0 && (
                                            <div
                                                className="absolute top-0 bottom-0 right-0 bg-slate-600/50 border-l border-slate-500"
                                                style={{ width: `${hollowLevel * 10}%` }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Detailed XP Bar */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            <span className="text-sm font-medium text-slate-300">Experience</span>
                                            <span className="text-xs text-slate-400 font-mono">{xp}/{xpToLevel}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Next level in {xpToLevel - xp} XP</span>
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                                                {Math.round(xpPercentage)}%
                                            </span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={xpPercentage}
                                        className="h-3 bg-slate-800 border border-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400"
                                    />
                                </div>

                                {/* Flasks + Death */}
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

                                {/* Attributes Grid */}
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
                                                <div key={attr} className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700 hover:border-slate-600 transition-colors">
                                                    <div className="text-lg">{info.emoji}</div>
                                                    <div className="text-xs text-slate-400">{info.shortLabel}</div>
                                                    <div className={cn("text-sm font-bold", info.color)}>
                                                        Lv {level}
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-700 rounded-full mt-1">
                                                        <div
                                                            className="h-full bg-slate-500 rounded-full transition-all duration-300"
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

                                {/* Danger Zone — Reset buried here */}
                                <details className="group">
                                    <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 select-none">
                                        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                                        Danger Zone
                                    </summary>
                                    <div className="mt-3 p-3 rounded-xl border border-red-500/20 bg-red-950/10">
                                        <p className="text-xs text-slate-500 mb-3">
                                            This will permanently erase all progress. There is no undo.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setShowResetModal(true); }}
                                            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                            Reset Journey
                                        </Button>
                                    </div>
                                </details>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
