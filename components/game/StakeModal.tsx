'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Swords, Heart, Zap, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface StakeModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function StakeModal({ task, isOpen, onClose, onConfirm }: StakeModalProps) {
    const { hp, isDowned } = useGameStore();

    const canAttempt = hp >= task.hpStake && !isDowned;
    const isRisky = task.hpStake >= hp * 0.5;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "relative z-10 w-full max-w-md",
                            "bg-gradient-to-b from-slate-800 to-slate-900",
                            "border-2 rounded-2xl shadow-2xl overflow-hidden",
                            isRisky ? "border-red-500/50" : "border-amber-500/50"
                        )}
                    >
                        {/* Header */}
                        <div className={cn(
                            "p-6 text-center",
                            "bg-gradient-to-b from-slate-700/50 to-transparent"
                        )}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Swords className={cn(
                                    "w-6 h-6",
                                    isRisky ? "text-red-400" : "text-amber-400"
                                )} />
                                <h2 className="text-xl font-bold text-white">
                                    Traverse the Fog Gate?
                                </h2>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Stake your HP to attempt this task
                            </p>
                        </div>

                        {/* Task info */}
                        <div className="px-6 pb-4">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <h3 className="font-semibold text-white text-lg mb-2">
                                    {task.title}
                                </h3>
                                {task.notes && (
                                    <p className="text-slate-400 text-sm">{task.notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Stakes */}
                        <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                            {/* HP Cost */}
                            <div className={cn(
                                "p-4 rounded-xl border text-center",
                                isRisky
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-slate-800/50 border-slate-700"
                            )}>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Heart className={cn(
                                        "w-5 h-5",
                                        isRisky ? "text-red-400" : "text-red-400"
                                    )} />
                                    <span className="text-sm text-slate-400">Stake</span>
                                </div>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    isRisky ? "text-red-400" : "text-red-400"
                                )}>
                                    -{task.hpStake} HP
                                </div>
                            </div>

                            {/* XP Reward */}
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm text-slate-400">Reward</span>
                                </div>
                                <div className="text-2xl font-bold text-amber-400">
                                    +{task.baseSouls} Souls
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        {isRisky && (
                            <div className="mx-6 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                <span className="text-red-300 text-sm">
                                    High risk! This costs over 50% of your current HP.
                                </span>
                            </div>
                        )}

                        {/* Cannot attempt warning */}
                        {!canAttempt && (
                            <div className="mx-6 mb-4 p-3 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center gap-2">
                                <X className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-slate-400 text-sm">
                                    {isDowned
                                        ? "Cannot attempt while downed. Complete a Recovery Run first."
                                        : `Not enough HP. You need ${task.hpStake} HP but only have ${hp}.`
                                    }
                                </span>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="p-6 pt-0 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 border-slate-600 hover:bg-slate-700"
                            >
                                Back Off
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={!canAttempt}
                                className={cn(
                                    "flex-1 font-bold",
                                    canAttempt && !isRisky && "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
                                    canAttempt && isRisky && "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500",
                                    !canAttempt && "bg-slate-700 text-slate-400"
                                )}
                            >
                                <Swords className="w-4 h-4 mr-2" />
                                {isRisky ? "Risk It!" : "Attempt Task"}
                            </Button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
