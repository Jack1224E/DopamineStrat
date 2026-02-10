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
        setTimeout(() => { setIsBuying(false); }, 500);
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "relative group flex flex-col gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)]",
                    "bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]",
                    "transition-all duration-200",
                    !canAfford && "opacity-60 grayscale-[0.2]"
                )}
            >
                {/* Header: Icon + Title + Menu */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-subtle)]",
                            canAfford ? "text-amber-400" : "text-[var(--text-muted)]"
                        )}>
                            <Coins className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold leading-tight text-[var(--text-primary)]">
                                {reward.title}
                            </h3>
                            <div className="text-xs font-mono font-medium mt-0.5 flex items-center gap-1 text-[var(--text-muted)]">
                                <span className={cn(canAfford ? "text-amber-400" : "text-rose-400")}>
                                    {reward.cost}
                                </span>
                                <Coins className="w-3 h-3 text-amber-500" />
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
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded-md hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => { setShowMenu(false); }}
                                />
                                <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg bg-[var(--surface-2)] border border-[var(--border-strong)] shadow-lg overflow-hidden py-1">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(true);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] flex items-center gap-2"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteReward(reward.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-[var(--surface-3)] hover:text-rose-300 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Buy Button */}
                <Button
                    onClick={handleBuy}
                    disabled={!canAfford}
                    className={cn(
                        "w-full h-8 text-xs font-bold uppercase tracking-wider transition-all shadow-sm",
                        canAfford
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-900/10"
                            : "bg-[var(--surface-0)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed"
                    )}
                >
                    {canAfford ? (
                        <span className="flex items-center gap-1">
                            Buy
                        </span>
                    ) : (
                        `Need ${reward.cost - souls}`
                    )}
                </Button>
            </motion.div>

            <RewardEditModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); }}
                reward={reward}
                onSave={(updates) => updateReward(reward.id, updates)}
                onDelete={() => deleteReward(reward.id)}
            />
        </>
    );
}
