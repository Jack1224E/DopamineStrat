'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Coins, X, ShoppingBag, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SHOP_ITEMS, type ShopItemId } from '@/types/categories';

interface FlaskShopProps {
    isOpen: boolean;
    onClose: () => void;
}

const ITEM_ICONS: Record<ShopItemId, React.ReactNode> = {
    estus_flask: <span className="text-2xl">🧪</span>,
    human_effigy: <span className="text-2xl">👤</span>,
    ring_of_protection: <Shield className="w-6 h-6 text-blue-400" />,
    golden_pine_resin: <Sparkles className="w-6 h-6 text-yellow-400" />,
};

export function FlaskShop({ isOpen, onClose }: FlaskShopProps) {
    const {
        souls, inventory, activeBuffs, hollowLevel,
        flasks, maxFlasks, buyItem, useItem
    } = useGameStore();

    // Filter out estus_flask from regular items (it's handled separately)
    const regularItems = Object.values(SHOP_ITEMS).filter(item => item.id !== 'estus_flask');
    const flaskItem = SHOP_ITEMS.estus_flask;

    const handleBuy = (itemId: ShopItemId) => {
        buyItem(itemId);
    };

    const handleUse = (itemId: ShopItemId) => {
        useItem(itemId);
    };

    const canBuyFlask = () => {
        return souls >= flaskItem.cost && flasks < maxFlasks;
    };

    const canBuyItem = (itemId: ShopItemId) => {
        const item = SHOP_ITEMS[itemId];
        return souls >= item.cost && inventory[itemId] < item.maxQuantity;
    };

    const canUse = (itemId: ShopItemId) => {
        if (inventory[itemId] <= 0) return false;
        if (itemId === 'human_effigy' && hollowLevel <= 0) return false;
        if (itemId === 'ring_of_protection' && activeBuffs.ringOfProtection) return false;
        if (itemId === 'golden_pine_resin' && activeBuffs.goldenPineResin) return false;
        return true;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-start justify-end p-4 sm:p-6 pt-32 sm:pt-32"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 20 }}
                        className={cn(
                            "relative z-10 w-full max-w-md max-h-[80vh] flex flex-col",
                            "bg-[var(--surface-1)]",
                            "rounded-xl border border-[var(--border-strong)]",
                            "shadow-2xl shadow-black/20"
                        )}
                        style={{
                            boxShadow: "0 0 40px -10px var(--primary)"
                        }}
                    >
                        {/* Header */}
                        <div className="flex-none flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Bonfire Shop</h2>
                                    <p className="text-xs text-[var(--text-muted)]">Rest and resupply</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                                    <Coins className="w-4 h-4 text-amber-500" />
                                    <span className="font-bold text-[var(--text-primary)]">{souls}</span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-full hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[var(--border-strong)] scrollbar-track-transparent">

                            {/* Active Buffs */}
                            {(activeBuffs.ringOfProtection || activeBuffs.goldenPineResin) && (
                                <div className="mb-6 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                                    <div className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">Active Buffs</div>
                                    <div className="flex gap-2">
                                        {activeBuffs.ringOfProtection && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-xs font-medium text-blue-500 border border-blue-500/20">
                                                <Shield className="w-3 h-3" />
                                                Protection
                                            </div>
                                        )}
                                        {activeBuffs.goldenPineResin && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/10 text-xs font-medium text-yellow-600 border border-yellow-500/20">
                                                <Sparkles className="w-3 h-3" />
                                                2x Souls
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Estus Flask - Special handling */}
                                <motion.div
                                    className={cn(
                                        "p-4 rounded-xl border transition-all duration-200",
                                        "bg-gradient-to-r from-orange-500/5 to-amber-500/5",
                                        canBuyFlask()
                                            ? "border-orange-500/30 hover:border-orange-500/60 shadow-sm"
                                            : "border-[var(--border-subtle)] opacity-60 grayscale"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-inner",
                                            "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40",
                                            "border border-orange-200 dark:border-orange-800"
                                        )}>
                                            {ITEM_ICONS.estus_flask}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[var(--text-primary)]">{flaskItem.name}</h3>
                                                <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-[10px] font-bold text-orange-600 border border-orange-200 uppercase tracking-tight">
                                                    {flasks}/{maxFlasks}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">
                                                {flaskItem.description}
                                            </p>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                                                <span>✦</span> {flaskItem.effect}
                                            </p>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => handleBuy('estus_flask')}
                                            disabled={!canBuyFlask()}
                                            className={cn(
                                                "min-w-[90px] shadow-sm font-semibold",
                                                canBuyFlask()
                                                    ? "bg-orange-600 hover:bg-orange-500 text-white border-none"
                                                    : "bg-[var(--surface-3)] text-[var(--text-muted)]"
                                            )}
                                        >
                                            <Coins className="w-3.5 h-3.5 mr-1.5" />
                                            {flaskItem.cost}
                                        </Button>
                                    </div>
                                </motion.div>

                                {/* Regular Items */}
                                {regularItems.map((item) => {
                                    const owned = inventory[item.id];
                                    const canBuyThis = canBuyItem(item.id);
                                    const canUseThis = canUse(item.id);

                                    return (
                                        <motion.div
                                            key={item.id}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all duration-200",
                                                "bg-[var(--surface-1)] hover:bg-[var(--surface-2)]",
                                                canBuyThis
                                                    ? "border-[var(--border-subtle)] hover:border-[var(--primary)]/30"
                                                    : "border-[var(--border-subtle)] opacity-60"
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm",
                                                    "bg-[var(--surface-2)] border border-[var(--border-subtle)]"
                                                )}>
                                                    {ITEM_ICONS[item.id]}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-[var(--text-primary)]">{item.name}</h3>
                                                        {owned > 0 && (
                                                            <span className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[10px] font-medium text-[var(--text-muted)] border border-[var(--border-subtle)]">
                                                                x{owned}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                                                        <span>✦</span> {item.effect}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleBuy(item.id)}
                                                        disabled={!canBuyThis}
                                                        className={cn(
                                                            "min-w-[90px] font-semibold shadow-sm",
                                                            canBuyThis
                                                                ? "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
                                                                : "bg-[var(--surface-3)] text-[var(--text-muted)]"
                                                        )}
                                                    >
                                                        <Coins className="w-3.5 h-3.5 mr-1.5" />
                                                        {item.cost}
                                                    </Button>

                                                    {owned > 0 && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUse(item.id)}
                                                            disabled={!canUseThis}
                                                            className={cn(
                                                                "min-w-[90px] text-xs h-7",
                                                                canUseThis
                                                                    ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                                                                    : "opacity-50"
                                                            )}
                                                        >
                                                            Use
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-none p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-1)]/50 rounded-b-xl">
                            <p className="text-xs text-center text-[var(--text-muted)] flex items-center justify-center gap-2">
                                {hollowLevel > 0 ? (
                                    <>
                                        <span className="text-red-500">⚠️</span>
                                        <span>Use <span className="font-semibold">Human Effigy</span> to reverse hollowing</span>
                                    </>
                                ) : (
                                    "Rest at the bonfire, Chosen Undead"
                                )}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
