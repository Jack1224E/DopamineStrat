'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { Heart, Zap, RotateCcw, ChevronDown, ChevronUp, Flame, Trophy, Shield, Target, Sparkles, Crown, Skull, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlaskCounter } from '@/components/game/FlaskCounter';

// Layer 1: Enhanced health status with game-like descriptions
function getHealthStatus(hpPercent: number): {
    message: string;
    emoji: string;
    color: string;
    subtitle: string;
    gradient: string;
} {
    if (hpPercent >= 90) return {
        message: 'Invincible!',
        emoji: '👑',
        color: 'text-purple-400',
        subtitle: 'Nothing can stop you',
        gradient: 'from-purple-500/20 to-pink-500/20'
    };
    if (hpPercent >= 70) return {
        message: 'Feeling strong!',
        emoji: '💪',
        color: 'text-emerald-400',
        subtitle: 'Energy is overflowing',
        gradient: 'from-emerald-500/20 to-cyan-500/20'
    };
    if (hpPercent >= 50) return {
        message: 'Steady & Ready',
        emoji: '⚡',
        color: 'text-amber-400',
        subtitle: 'Keep pushing forward',
        gradient: 'from-amber-500/20 to-orange-500/20'
    };
    if (hpPercent >= 30) return {
        message: 'Need rest',
        emoji: '😓',
        color: 'text-orange-400',
        subtitle: 'Take it easy for a bit',
        gradient: 'from-orange-500/20 to-red-500/20'
    };
    if (hpPercent >= 10) return {
        message: 'Danger Zone!',
        emoji: '⚠️',
        color: 'text-red-400',
        subtitle: 'Recovery needed',
        gradient: 'from-red-500/20 to-rose-500/20'
    };
    return {
        message: 'CRITICAL!',
        emoji: '🆘',
        color: 'text-rose-400',
        subtitle: 'Immediate action required',
        gradient: 'from-rose-600/30 to-red-600/30'
    };
}

// Layer 6: Enhanced motivation messages
function getMotivationMessage(level: number, xpPercent: number, xp: number): {
    message: string;
    icon: React.ReactNode;
    color: string;
} {
    if (xpPercent >= 95) return {
        message: "LEVEL UP IMMINENT!",
        icon: <Sparkles className="w-3 h-3" />,
        color: "text-yellow-300"
    };
    if (xpPercent >= 75) return {
        message: "Almost there! Keep going!",
        icon: <Flame className="w-3 h-3" />,
        color: "text-orange-400"
    };
    if (xpPercent >= 50) return {
        message: "Halfway to greatness!",
        icon: <Target className="w-3 h-3" />,
        color: "text-amber-400"
    };
    if (level >= 10) return {
        message: "Legend in the making!",
        icon: <Crown className="w-3 h-3" />,
        color: "text-purple-400"
    };
    if (level >= 5) return {
        message: "Master adventurer!",
        icon: <Trophy className="w-3 h-3" />,
        color: "text-cyan-400"
    };
    if (xp > 0) return {
        message: "Every step counts!",
        icon: <Zap className="w-3 h-3" />,
        color: "text-emerald-400"
    };
    return {
        message: "Start your journey!",
        icon: <Shield className="w-3 h-3" />,
        color: "text-slate-400"
    };
}

export function StatsBar() {
    const {
        hp, maxHp, xp, unbankedXp, xpToLevel, level,
        deathCount, isDowned, bankXp,
        resetStats
    } = useGameStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate percentages
    const totalXp = xp + unbankedXp;
    const xpPercentage = useMemo(() => (totalXp / xpToLevel) * 100, [totalXp, xpToLevel]);
    const hpPercentage = useMemo(() => (hp / maxHp) * 100, [hp, maxHp]);

    const healthStatus = useMemo(() => getHealthStatus(hpPercentage), [hpPercentage]);
    const motivation = useMemo(() => getMotivationMessage(level, xpPercentage, totalXp), [level, xpPercentage, totalXp]);

    const handleResetClick = () => {
        if (showResetConfirm) {
            resetStats();
            setShowResetConfirm(false);
        } else {
            setShowResetConfirm(true);
            setTimeout(() => setShowResetConfirm(false), 3000);
        }
    };

    // Avatar animations
    const avatarVariants = {
        normal: { scale: 1, rotate: 0 },
        hover: { scale: 1.05, rotate: 5 },
        critical: { scale: 1.1, rotate: [0, 5, -5, 0] },
    };

    return (
        <div
            className={cn(
                "space-y-4 p-4 rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm",
                "shadow-2xl shadow-black/20",
                hpPercentage < 20 && "animate-pulse-slow border-red-500/30",
                isDowned && "border-red-500/50 bg-gradient-to-br from-red-950/30 to-slate-900/90"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        variants={avatarVariants}
                        animate={hpPercentage < 20 ? "critical" : isHovered ? "hover" : "normal"}
                        className={cn(
                            "relative w-16 h-16 rounded-xl border-2",
                            "bg-gradient-to-br from-primary/20 to-accent/20",
                            "flex items-center justify-center cursor-pointer",
                            healthStatus.gradient && `bg-gradient-to-br ${healthStatus.gradient}`,
                            "shadow-lg",
                            isDowned && "grayscale opacity-70"
                        )}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <span className="text-3xl">{isDowned ? '💀' : '🧙‍♂️'}</span>
                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full blur-sm" />
                                <div className={cn(
                                    "relative px-3 py-1 rounded-full text-xs font-bold",
                                    "bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950",
                                    "flex items-center gap-1 shadow-lg"
                                )}>
                                    <Trophy className="w-3 h-3" />
                                    Lv {level}
                                </div>
                            </div>
                        </div>
                        {/* Health Status Emoji */}
                        <div className="absolute -top-2 -left-2">
                            <div className="bg-slate-900 rounded-full p-1.5 shadow-lg border border-slate-700">
                                <span className="text-sm">{healthStatus.emoji}</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-1">
                        <h3 className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            {isDowned ? 'Fallen Adventurer' : 'Adventurer'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium", healthStatus.color)}>
                                {isDowned ? 'YOU DIED' : healthStatus.message}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400">
                                {isDowned ? 'Complete Recovery Run' : healthStatus.subtitle}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expand Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shrink-0 h-12 w-12 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
                >
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Stats Bars */}
            <div className="space-y-3">
                {/* HP Bar */}
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
                            </span>
                        </div>
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded",
                            hpPercentage > 70 ? "bg-red-500/20 text-red-400" :
                                hpPercentage > 30 ? "bg-orange-500/20 text-orange-400" :
                                    "bg-rose-500/20 text-rose-400 animate-pulse"
                        )}>
                            {Math.round(hpPercentage)}%
                        </span>
                    </div>
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
                </div>

                {/* XP Bar with Unbanked indicator */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-slate-300">Experience</span>
                            <span className="text-xs text-slate-400 font-mono">
                                {xp}
                                {unbankedXp > 0 && (
                                    <span className="text-amber-400"> +{unbankedXp}</span>
                                )}
                                /{xpToLevel}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {unbankedXp > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={bankXp}
                                    className="h-6 px-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                                    title="Bank XP to protect from death"
                                >
                                    <Coins className="w-3 h-3 mr-1" />
                                    Bank
                                </Button>
                            )}
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded",
                                "bg-amber-500/20 text-amber-400"
                            )}>
                                {Math.round(xpPercentage)}%
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <Progress
                            value={(xp / xpToLevel) * 100}
                            className={cn(
                                "h-3 bg-slate-800 border border-slate-700",
                                "[&>div]:transition-all [&>div]:duration-500",
                                "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-400"
                            )}
                        />
                        {/* Unbanked XP overlay */}
                        {unbankedXp > 0 && (
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400/50 to-amber-300/50 animate-pulse rounded-full"
                                style={{
                                    left: `${(xp / xpToLevel) * 100}%`,
                                    width: `${(unbankedXp / xpToLevel) * 100}%`,
                                }}
                            />
                        )}
                    </div>
                    {unbankedXp > 0 && (
                        <p className="text-xs text-amber-400/70 italic">
                            ⚠️ Unbanked XP is lost on death!
                        </p>
                    )}
                </div>
            </div>

            {/* Flask Counter */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Flasks:</span>
                    <FlaskCounter />
                </div>

                {/* Death Counter */}
                {deathCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
                        <Skull className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-mono text-slate-300">{deathCount}</span>
                    </div>
                )}
            </div>

            {/* Motivation Message */}
            <div className={cn(
                "flex items-center gap-2 p-3 rounded-xl border",
                "bg-gradient-to-r from-slate-800/50 to-slate-900/50",
                motivation.color.includes('yellow') && "border-yellow-500/30",
                motivation.color.includes('purple') && "border-purple-500/30",
                motivation.color.includes('cyan') && "border-cyan-500/30",
            )}>
                <div className={cn("p-2 rounded-lg", motivation.color.replace('text', 'bg') + '/20')}>
                    {motivation.icon}
                </div>
                <span className={cn("text-sm font-medium", motivation.color)}>
                    {motivation.message}
                </span>
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
                            {/* Stats Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-1">Level</div>
                                    <div className="text-2xl font-bold text-white">{level}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {xpPercentage >= 95 ? "Ready to level up!" : "Keep going!"}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-1">Total XP</div>
                                    <div className="text-2xl font-bold text-amber-400">
                                        {totalXp}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {unbankedXp > 0 ? `${unbankedXp} at risk` : "All safe"}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-1">Deaths</div>
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        deathCount > 0 ? "text-red-400" : "text-slate-500"
                                    )}>
                                        {deathCount}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {deathCount === 0 ? "Untouched" : "Badge of honor"}
                                    </div>
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
                                        "border-slate-700 hover:border-slate-600",
                                        "bg-gradient-to-r from-slate-900 to-slate-800"
                                    )}
                                >
                                    <RotateCcw className={cn(
                                        "w-4 h-4 mr-2 transition-transform",
                                        showResetConfirm && "animate-spin"
                                    )} />
                                    {showResetConfirm ? (
                                        <span className="font-bold">Confirm Reset - Are you sure?</span>
                                    ) : (
                                        <span>Reset Journey</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
