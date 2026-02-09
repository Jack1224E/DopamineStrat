'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { FLASK_CONFIG } from '@/types/categories';

export function FlaskCounter() {
    const { flasks, maxFlasks, useFlask, isDowned } = useGameStore();

    const handleUseFlask = () => {
        if (flasks > 0 && !isDowned) {
            useFlask();
        }
    };

    return (
        <div className="flex items-center gap-1">
            {/* Flask bottles */}
            {Array.from({ length: maxFlasks }).map((_, index) => {
                const isFilled = index < flasks;
                const canUse = isFilled && !isDowned;

                return (
                    <motion.button
                        key={index}
                        onClick={canUse ? handleUseFlask : undefined}
                        disabled={!canUse}
                        whileHover={canUse ? { scale: 1.1 } : undefined}
                        whileTap={canUse ? { scale: 0.95 } : undefined}
                        className={cn(
                            "relative w-8 h-10 rounded-b-lg rounded-t-sm border-2",
                            "flex items-end justify-center overflow-hidden",
                            "transition-all duration-300",
                            canUse && "cursor-pointer hover:border-amber-400/50",
                            !canUse && "cursor-not-allowed opacity-50",
                            isFilled
                                ? "border-amber-500/50 bg-slate-800"
                                : "border-slate-600 bg-slate-900"
                        )}
                        title={canUse ? `Use Flask (+${FLASK_CONFIG.healAmount} HP)` : isFilled ? "Cannot use while downed" : "Empty"}
                    >
                        {/* Flask neck */}
                        <div className={cn(
                            "absolute top-0 left-1/2 -translate-x-1/2 w-3 h-2 rounded-t",
                            isFilled ? "bg-amber-600" : "bg-slate-700"
                        )} />

                        {/* Liquid */}
                        {isFilled && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: '70%' }}
                                className={cn(
                                    "absolute bottom-0 left-0 right-0",
                                    "bg-gradient-to-t from-amber-600 via-orange-500 to-amber-400",
                                    "opacity-90"
                                )}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </motion.div>
                        )}

                        {/* Glow when filled */}
                        {isFilled && (
                            <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
                        )}
                    </motion.button>
                );
            })}

            {/* Heal amount label */}
            <div className="ml-2 text-xs text-slate-400">
                <span className="text-amber-400 font-bold">+{FLASK_CONFIG.healAmount}</span> HP
            </div>
        </div>
    );
}
