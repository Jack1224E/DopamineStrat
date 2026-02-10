'use client';

import { useState } from 'react';
import { Plus, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { RewardCard } from './RewardCard';
import { cn } from '@/lib/utils';

import type { Reward } from '@/types';

interface RewardColumnProps {
    rewards?: Reward[]; // Optional prop to support filtering
}

export function RewardColumn({ rewards: propRewards }: RewardColumnProps) {
    const { rewards: storeRewards, addReward } = useGameStore();
    const rewards = propRewards ?? storeRewards; // Use prop if available, else store

    const [isAdding, setIsAdding] = useState(false);

    const [newRewardTitle, setNewRewardTitle] = useState('');
    const [newRewardCost, setNewRewardCost] = useState(100);

    const handleAddReward = () => {
        if (!newRewardTitle.trim()) return;
        addReward(newRewardTitle, newRewardCost);
        setNewRewardTitle('');
        setNewRewardCost(100);
        setIsAdding(false);
    };

    return (
        <div className="flex flex-col gap-4 h-full min-w-[300px]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow-md">🎁</span>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-slate-100 leading-none">Rewards</h2>
                        <span className="text-xs text-slate-400 font-medium mt-1">
                            {rewards.length} Items
                        </span>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setIsAdding(!isAdding); }}
                    className={cn(
                        "h-8 w-8 p-0 rounded-full transition-all",
                        isAdding
                            ? "bg-slate-700 text-white rotate-45"
                            : "hover:bg-slate-700 text-slate-400 hover:text-amber-400"
                    )}
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            {/* Quick Add Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 mb-2 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Reward title..."
                                value={newRewardTitle}
                                onChange={(e) => { setNewRewardTitle(e.target.value); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddReward()}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                            />
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                    </div>
                                    <input
                                        type="number"
                                        value={newRewardCost}
                                        onChange={(e) => { setNewRewardCost(Number(e.target.value)); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddReward()}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleAddReward}
                                    disabled={!newRewardTitle.trim()}
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/20"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rewards List */}
            <div className="flex flex-col gap-3 pb-8">
                {rewards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 shadow-inner">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-300">No rewards yet</p>
                        <p className="text-xs text-slate-500 mt-1 text-center max-w-[200px]">
                            Create rewards to spend your hard-earned Souls on!
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {rewards.map((reward) => (
                            <RewardCard key={reward.id} reward={reward} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
