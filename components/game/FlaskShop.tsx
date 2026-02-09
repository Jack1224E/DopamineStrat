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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "relative z-10 w-full max-w-lg",
                            "bg-gradient-to-br from-slate-900 to-slate-800",
                            "rounded-2xl border border-amber-500/30",
                            "shadow-2xl shadow-amber-500/10"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <ShoppingBag className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Bonfire Shop</h2>
                                    <p className="text-xs text-slate-400">Rest and resupply</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                                    <Coins className="w-4 h-4 text-cyan-400" />
                                    <span className="font-bold text-cyan-300">{souls}</span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-full hover:bg-slate-700"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Active Buffs */}
                        {(activeBuffs.ringOfProtection || activeBuffs.goldenPineResin) && (
                            <div className="mx-4 mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                <div className="text-xs font-medium text-purple-400 mb-2">Active Buffs</div>
                                <div className="flex gap-2">
                                    {activeBuffs.ringOfProtection && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 text-xs text-blue-400">
                                            <Shield className="w-3 h-3" />
                                            Protection
                                        </div>
                                    )}
                                    {activeBuffs.goldenPineResin && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 text-xs text-yellow-400">
                                            <Sparkles className="w-3 h-3" />
                                            2x Souls
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Shop Items */}
                        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                            {/* Estus Flask - Special handling */}
                            <motion.div
                                className={cn(
                                    "p-4 rounded-xl border transition-all",
                                    "bg-gradient-to-r from-orange-900/20 to-amber-900/20",
                                    canBuyFlask()
                                        ? "border-orange-500/50 hover:border-orange-400"
                                        : "border-slate-700 opacity-70"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center",
                                        "bg-gradient-to-br from-orange-700 to-amber-800",
                                        "border border-orange-600"
                                    )}>
                                        {ITEM_ICONS.estus_flask}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{flaskItem.name}</h3>
                                            <span className="px-2 py-0.5 rounded bg-orange-500/30 text-xs text-orange-300">
                                                {flasks}/{maxFlasks}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-0.5">
                                            {flaskItem.description}
                                        </p>
                                        <p className="text-xs text-emerald-400 mt-1">
                                            ✦ {flaskItem.effect}
                                        </p>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleBuy('estus_flask')}
                                        disabled={!canBuyFlask()}
                                        className={cn(
                                            "min-w-[100px]",
                                            canBuyFlask()
                                                ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
                                                : "bg-slate-700"
                                        )}
                                    >
                                        <Coins className="w-3 h-3 mr-1" />
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
                                            "p-4 rounded-xl border transition-all",
                                            "bg-slate-800/50",
                                            canBuyThis
                                                ? "border-slate-600 hover:border-amber-500/50"
                                                : "border-slate-700 opacity-70"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center",
                                                "bg-gradient-to-br from-slate-700 to-slate-800",
                                                "border border-slate-600"
                                            )}>
                                                {ITEM_ICONS[item.id]}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{item.name}</h3>
                                                    {owned > 0 && (
                                                        <span className="px-2 py-0.5 rounded bg-slate-700 text-xs text-slate-300">
                                                            x{owned}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-0.5">
                                                    {item.description}
                                                </p>
                                                <p className="text-xs text-emerald-400 mt-1">
                                                    ✦ {item.effect}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleBuy(item.id)}
                                                    disabled={!canBuyThis}
                                                    className={cn(
                                                        "min-w-[100px]",
                                                        canBuyThis
                                                            ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                                                            : "bg-slate-700"
                                                    )}
                                                >
                                                    <Coins className="w-3 h-3 mr-1" />
                                                    {item.cost}
                                                </Button>

                                                {owned > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUse(item.id)}
                                                        disabled={!canUseThis}
                                                        className={cn(
                                                            "min-w-[100px]",
                                                            canUseThis
                                                                ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
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

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-700">
                            <p className="text-xs text-center text-slate-500">
                                {hollowLevel > 0 && "⚠️ Use Human Effigy to reverse hollowing"}
                                {hollowLevel === 0 && "Rest at the bonfire, Chosen Undead"}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
