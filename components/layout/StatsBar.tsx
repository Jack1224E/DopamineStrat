'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { Heart, Zap, RotateCcw, ChevronDown, ChevronUp, Flame, Trophy } from 'lucide-react';

// Layer 1 (GAM-01): Add meaning beyond PBL numbers
function getHealthStatus(hpPercent: number): { message: string; emoji: string; color: string } {
    if (hpPercent >= 80) return { message: 'Feeling strong!', emoji: '💪', color: 'text-success' };
    if (hpPercent >= 50) return { message: 'Staying steady', emoji: '😊', color: 'text-amber-500' };
    if (hpPercent >= 25) return { message: 'Need some rest', emoji: '😓', color: 'text-orange-500' };
    return { message: 'Critical! Take care', emoji: '🆘', color: 'text-destructive' };
}

// Layer 6 (GAM-03): Intrinsic motivation messages based on activity
function getMotivationMessage(level: number, xpPercent: number): string {
    if (xpPercent >= 90) return "Almost there! One more push! 🔥";
    if (xpPercent >= 50) return "Halfway to the next level!";
    if (level >= 5) return "You're becoming a master!";
    if (level >= 3) return "Building great habits!";
    return "Every step counts!";
}

export function StatsBar() {
    const { hp, maxHp, xp, xpToLevel, level, resetStats } = useGameStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    // Layer 4 (UX-02): Real-time feedback state
    const [lastChange, setLastChange] = useState<{ type: 'hp' | 'xp'; delta: number } | null>(null);
    const [prevHp, setPrevHp] = useState(hp);
    const [prevXp, setPrevXp] = useState(xp);

    const hpPercentage = (hp / maxHp) * 100;
    const xpPercentage = (xp / xpToLevel) * 100;
    const healthStatus = getHealthStatus(hpPercentage);
    const motivationMessage = getMotivationMessage(level, xpPercentage);

    // Layer 4 (UX-02): Detect changes and show inline feedback
    useEffect(() => {
        if (hp !== prevHp) {
            const delta = hp - prevHp;
            setLastChange({ type: 'hp', delta });
            setPrevHp(hp);
            setTimeout(() => setLastChange(null), 1500);
        }
    }, [hp, prevHp]);

    useEffect(() => {
        if (xp !== prevXp) {
            const delta = xp - prevXp;
            setLastChange({ type: 'xp', delta });
            setPrevXp(xp);
            setTimeout(() => setLastChange(null), 1500);
        }
    }, [xp, prevXp]);

    const handleResetClick = () => {
        if (showResetConfirm) {
            resetStats();
            setShowResetConfirm(false);
        } else {
            setShowResetConfirm(true);
            setTimeout(() => setShowResetConfirm(false), 3000);
        }
    };

    return (
        <div className="space-y-3">
            {/* Main stats row */}
            <div className="flex items-center gap-4">
                {/* Layer 5 (UI-01): Larger touch target for avatar */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative p-1 -m-1 rounded-xl hover:bg-muted/50 transition-colors"
                    aria-label="Toggle stats details"
                >
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/50 shrink-0">
                        <span className="text-2xl">🧙</span>
                    </div>
                    <span className="absolute -bottom-1 -right-0 text-sm bg-background rounded-full p-0.5 shadow-sm">
                        {healthStatus.emoji}
                    </span>
                </button>

                {/* Compact info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">Adventurer</span>
                            {/* Layer 5 (UI-01): Larger level badge for touch */}
                            <span className="px-2.5 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Lv. {level}
                            </span>
                        </div>
                        {/* Layer 6 (GAM-03): Intrinsic motivation message */}
                        <span className={`text-xs italic hidden sm:block ${healthStatus.color}`}>
                            {motivationMessage}
                        </span>
                    </div>

                    {/* Inline bars with feedback */}
                    <div className="flex items-center gap-4">
                        {/* HP Bar */}
                        <div className="flex items-center gap-2 flex-1 relative">
                            <Heart className="w-4 h-4 text-destructive shrink-0" />
                            <Progress
                                value={hpPercentage}
                                className="h-2.5 flex-1 bg-muted [&>div]:bg-[hsl(var(--hp-bar))] [&>div]:transition-all [&>div]:duration-300"
                            />
                            <span className="text-xs text-muted-foreground w-14 text-right font-mono">{hp}/{maxHp}</span>

                            {/* Layer 4 (UX-02): Inline change feedback */}
                            <AnimatePresence>
                                {lastChange?.type === 'hp' && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`absolute -top-5 right-0 text-xs font-bold ${lastChange.delta > 0 ? 'text-success' : 'text-destructive'}`}
                                    >
                                        {lastChange.delta > 0 ? '+' : ''}{lastChange.delta}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* XP Bar */}
                        <div className="flex items-center gap-2 flex-1 relative">
                            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                            <Progress
                                value={xpPercentage}
                                className="h-2.5 flex-1 bg-muted [&>div]:bg-amber-500 [&>div]:transition-all [&>div]:duration-300"
                            />
                            <span className="text-xs text-muted-foreground w-14 text-right font-mono">{xp}/{xpToLevel}</span>

                            {/* Layer 4: XP change feedback */}
                            <AnimatePresence>
                                {lastChange?.type === 'xp' && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute -top-5 right-0 text-xs font-bold text-success"
                                    >
                                        +{lastChange.delta} XP
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Layer 5 (UI-01): Larger expand button for touch */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shrink-0 h-10 w-10"
                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
            </div>

            {/* Expandable section */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            {/* Layer 8 (UX-03): Quick stats summary */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    {Math.floor(xpPercentage)}% to next level
                                </span>
                            </div>

                            {/* Layer 5 (UI-01): Larger reset button */}
                            <Button
                                variant={showResetConfirm ? "destructive" : "outline"}
                                size="default"
                                onClick={handleResetClick}
                                className="text-sm min-h-[44px] px-4"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {showResetConfirm ? 'Confirm Reset' : 'Reset Progress'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
