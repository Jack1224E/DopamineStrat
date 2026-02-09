'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Coins, X, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FLASK_CONFIG } from '@/types/categories';

interface FlaskShopProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FlaskShop({ isOpen, onClose }: FlaskShopProps) {
    const { souls, flasks, maxFlasks, buyFlask } = useGameStore();

    const canAfford = souls >= FLASK_CONFIG.flaskCost;
    const hasSpace = flasks < maxFlasks;
    const canBuy = canAfford && hasSpace;

    const handleBuy = () => {
        if (buyFlask()) {
            // Success - could add sound/animation here
        }
    };

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
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Shop Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "relative z-10 w-full max-w-sm",
                            "bg-gradient-to-b from-slate-800 to-slate-900",
                            "border-2 border-amber-500/30 rounded-2xl shadow-2xl"
                        )}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                        <ShoppingBag className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Flask Shop</h2>
                                        <p className="text-amber-400/80 text-sm">Restore your health</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Souls Balance */}
                        <div className="p-4 border-b border-slate-700">
                            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-900/30 border border-cyan-500/30">
                                <Coins className="w-5 h-5 text-cyan-400" />
                                <span className="text-2xl font-bold text-cyan-300">{souls}</span>
                                <span className="text-sm text-cyan-400/60">Souls</span>
                            </div>
                        </div>

                        {/* Flask Item */}
                        <div className="p-6">
                            <div className={cn(
                                "p-4 rounded-xl border transition-all",
                                "bg-slate-800/50",
                                canBuy
                                    ? "border-amber-500/50 hover:border-amber-400"
                                    : "border-slate-700 opacity-60"
                            )}>
                                <div className="flex items-center gap-4">
                                    {/* Flask visual */}
                                    <div className="relative w-12 h-16 rounded-b-lg rounded-t-sm border-2 border-amber-500/50 bg-slate-800 flex items-end justify-center overflow-hidden">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-t bg-amber-600" />
                                        <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-amber-600 via-orange-500 to-amber-400" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white">Estus Flask</h3>
                                        <p className="text-sm text-slate-400">Restores {FLASK_CONFIG.healAmount} HP</p>
                                        <div className="flex items-center gap-1 mt-2 text-amber-400">
                                            <Coins className="w-4 h-4" />
                                            <span className="font-bold">{FLASK_CONFIG.flaskCost}</span>
                                            <span className="text-sm text-slate-500">Souls</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xs text-slate-400">
                                            {flasks}/{maxFlasks}
                                        </span>
                                        <Button
                                            size="sm"
                                            disabled={!canBuy}
                                            onClick={handleBuy}
                                            className={cn(
                                                "min-w-[80px]",
                                                canBuy
                                                    ? "bg-amber-600 hover:bg-amber-500"
                                                    : "bg-slate-700 text-slate-400"
                                            )}
                                        >
                                            {!hasSpace ? "Full" : !canAfford ? "Need Souls" : "Buy"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <p className="mt-4 text-xs text-center text-slate-500">
                                ⚠️ Souls are lost on death! Spend or risk losing them.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
