'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import type { Reward } from '@/types';
import { RewardEditModal } from './RewardEditModal';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '@/lib/sounds';

interface RewardCardProps {
    reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
    const { souls, buyReward, updateReward, deleteReward, soundEnabled } = useGameStore();
    const [showMenu, setShowMenu] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const canAfford = souls >= reward.cost;

    const handleBuy = async () => {
        if (!canAfford || isBuying) return;

        setIsBuying(true);
        buyReward(reward.id);

        // Play sound and show confetti
        playSuccessSound(soundEnabled);
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#f59e0b', '#fbbf24', '#d97706'] // Amber/Gold colors
        });

        // Reset state after animation
        setTimeout(() => setIsBuying(false), 500);
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "relative group p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-all",
                    !canAfford && "opacity-60 grayscale-[0.5]"
                )}
            >
                {/* Header: Icon + Title + Menu */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700 ring-1 ring-white/10",
                            canAfford ? "text-amber-400" : "text-slate-500"
                        )}>
                            <Coins className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight">{reward.title}</h3>
                            <div className="text-xs text-amber-400/80 font-mono mt-0.5 font-medium flex items-center gap-1">
                                {reward.cost} <Coins className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg bg-slate-800 border border-slate-700 shadow-xl overflow-hidden py-1">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(true);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteReward(reward.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Notes (if any) */}
                {reward.notes && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 min-h-[1.5em]">
                        {reward.notes}
                    </p>
                )}
                {!reward.notes && <div className="mb-4" />} {/* Spacer */}

                {/* Buy Button */}
                <Button
                    onClick={handleBuy}
                    disabled={!canAfford}
                    className={cn(
                        "w-full h-9 text-xs font-bold uppercase tracking-wider transition-all",
                        canAfford
                            ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/20 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700"
                    )}
                >
                    {canAfford ? (
                        <span className="flex items-center gap-1">
                            Buy <Coins className="w-3 h-3" />
                        </span>
                    ) : (
                        `Need ${reward.cost - souls} More`
                    )}
                </Button>
            </motion.div>

            <RewardEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                reward={reward}
                onSave={(updates) => updateReward(reward.id, updates)}
                onDelete={() => deleteReward(reward.id)}
            />
        </>
    );
}
