'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Skull, RotateCcw, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DeathScreen() {
    const { isDowned, deathCount, xpLostTotal, unbankedXp, revive } = useGameStore();

    return (
        <AnimatePresence>
            {isDowned && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                        className="relative z-10 text-center space-y-8 px-8"
                    >
                        {/* YOU DIED text */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <h1 className={cn(
                                "text-6xl md:text-8xl font-bold tracking-[0.3em]",
                                "text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900",
                                "drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                            )}>
                                YOU DIED
                            </h1>
                        </motion.div>

                        {/* Decorative line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="w-64 h-0.5 mx-auto bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                        />

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-center gap-8 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Skull className="w-5 h-5 text-red-400" />
                                    <span className="text-lg">Deaths: <span className="text-white font-bold">{deathCount}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-amber-400" />
                                    <span className="text-lg">XP Lost: <span className="text-red-400 font-bold">{xpLostTotal}</span></span>
                                </div>
                            </div>

                            {unbankedXp > 0 && (
                                <p className="text-amber-400/80 text-sm italic">
                                    ⚠️ {unbankedXp} unbanked XP at risk until you recover
                                </p>
                            )}
                        </motion.div>

                        {/* Recovery prompt */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 }}
                            className="space-y-4"
                        >
                            <p className="text-slate-300 text-lg">
                                Complete a Recovery Run to revive
                            </p>

                            <Button
                                size="lg"
                                onClick={revive}
                                className={cn(
                                    "px-8 py-6 text-lg font-bold",
                                    "bg-gradient-to-r from-amber-600 to-orange-600",
                                    "hover:from-amber-500 hover:to-orange-500",
                                    "text-white shadow-lg shadow-amber-500/20",
                                    "border border-amber-500/30"
                                )}
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Begin Recovery Run
                            </Button>

                            <p className="text-slate-500 text-sm">
                                You will revive at 25% HP
                            </p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
