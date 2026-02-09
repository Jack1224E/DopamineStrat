'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
    Flame, X, ShoppingBag, Shield, Sword, Sparkles,
    Clock, Target, Zap, Heart, Check, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SHOP_ITEMS, type ConsumableType, type EquipmentType } from '@/types/economy';

interface BonfireShopProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BonfireShop({ isOpen, onClose }: BonfireShopProps) {
    const {
        xp, unbankedXp, bankXp,
        inventory, ownedEquipment, equipment,
        buyConsumable, buyEquipment, equipItem
    } = useGameStore();
    const [activeTab, setActiveTab] = useState<'consumables' | 'equipment'>('consumables');

    const totalXp = xp + unbankedXp;

    const handleBuyConsumable = (id: ConsumableType) => {
        buyConsumable(id);
    };

    const handleBuyEquipment = (id: EquipmentType) => {
        buyEquipment(id);
    };

    const consumableIcons: Record<ConsumableType, React.ReactNode> = {
        estus_flask: <Heart className="w-6 h-6 text-amber-400" />,
        green_blossom: <Clock className="w-6 h-6 text-emerald-400" />,
        gold_pine_resin: <Target className="w-6 h-6 text-yellow-400" />,
    };

    const equipmentIcons: Record<EquipmentType, React.ReactNode> = {
        greatshield: <Shield className="w-6 h-6 text-blue-400" />,
        ring_of_favor: <Sparkles className="w-6 h-6 text-purple-400" />,
        moonlight_greatsword: <Sword className="w-6 h-6 text-cyan-400" />,
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
                            "relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden",
                            "bg-gradient-to-b from-slate-800 to-slate-900",
                            "border-2 border-amber-500/30 rounded-2xl shadow-2xl"
                        )}
                    >
                        {/* Header */}
                        <div className="relative p-6 border-b border-slate-700 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Bonfire</h2>
                                    <p className="text-amber-400/80 text-sm">Spend your souls wisely</p>
                                </div>
                            </div>

                            {/* XP Display */}
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                {unbankedXp > 0 && (
                                    <Button
                                        size="sm"
                                        onClick={bankXp}
                                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                                    >
                                        Bank All
                                    </Button>
                                )}
                                <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-amber-500/30">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <span className="text-lg font-bold text-white">{totalXp}</span>
                                        <span className="text-sm text-amber-400/60">XP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-700">
                            <button
                                onClick={() => setActiveTab('consumables')}
                                className={cn(
                                    "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                                    activeTab === 'consumables'
                                        ? "text-amber-400 border-b-2 border-amber-400 bg-slate-800/50"
                                        : "text-slate-400 hover:text-slate-300"
                                )}
                            >
                                <ShoppingBag className="w-4 h-4 inline mr-2" />
                                Consumables
                            </button>
                            <button
                                onClick={() => setActiveTab('equipment')}
                                className={cn(
                                    "flex-1 px-6 py-3 text-sm font-medium transition-colors",
                                    activeTab === 'equipment'
                                        ? "text-amber-400 border-b-2 border-amber-400 bg-slate-800/50"
                                        : "text-slate-400 hover:text-slate-300"
                                )}
                            >
                                <Shield className="w-4 h-4 inline mr-2" />
                                Equipment
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4">
                            {activeTab === 'consumables' && (
                                <>
                                    {Object.entries(SHOP_ITEMS.consumables).map(([id, item]) => {
                                        const owned = inventory[id as ConsumableType];
                                        const canAfford = totalXp >= item.cost;
                                        const maxed = owned >= item.maxQuantity;

                                        return (
                                            <div
                                                key={id}
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all",
                                                    "bg-slate-800/50 hover:bg-slate-800",
                                                    canAfford && !maxed
                                                        ? "border-slate-600 hover:border-amber-500/50"
                                                        : "border-slate-700 opacity-60"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 rounded-lg bg-slate-700/50">
                                                        {consumableIcons[id as ConsumableType]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold text-white">{item.name}</h3>
                                                            <span className="text-xs text-slate-400">
                                                                Owned: {owned}/{item.maxQuantity}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                                                        <p className="text-xs text-amber-400/80 mt-2">{item.effect}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex items-center gap-1 text-amber-400">
                                                            <Zap className="w-4 h-4" />
                                                            <span className="font-bold">{item.cost}</span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            disabled={!canAfford || maxed}
                                                            onClick={() => handleBuyConsumable(id as ConsumableType)}
                                                            className={cn(
                                                                "min-w-[80px]",
                                                                canAfford && !maxed
                                                                    ? "bg-amber-600 hover:bg-amber-500"
                                                                    : "bg-slate-700 text-slate-400"
                                                            )}
                                                        >
                                                            {maxed ? "Maxed" : "Buy"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {activeTab === 'equipment' && (
                                <>
                                    {Object.entries(SHOP_ITEMS.equipment).map(([id, item]) => {
                                        const owned = ownedEquipment[id as EquipmentType];
                                        const equipped = equipment[id as EquipmentType];
                                        const canAfford = totalXp >= item.cost;

                                        return (
                                            <div
                                                key={id}
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all",
                                                    "bg-slate-800/50 hover:bg-slate-800",
                                                    equipped && "ring-2 ring-amber-500/50",
                                                    owned
                                                        ? "border-emerald-500/30"
                                                        : canAfford
                                                            ? "border-slate-600 hover:border-amber-500/50"
                                                            : "border-slate-700 opacity-60"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-lg",
                                                        owned ? "bg-emerald-500/20" : "bg-slate-700/50"
                                                    )}>
                                                        {equipmentIcons[id as EquipmentType]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-white">{item.name}</h3>
                                                            {owned && (
                                                                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">
                                                                    Owned
                                                                </span>
                                                            )}
                                                            {equipped && (
                                                                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
                                                                    Equipped
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                                                        <p className="text-xs text-cyan-400/80 mt-2">{item.effect}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {!owned && (
                                                            <div className="flex items-center gap-1 text-amber-400">
                                                                <Zap className="w-4 h-4" />
                                                                <span className="font-bold">{item.cost}</span>
                                                            </div>
                                                        )}
                                                        {owned ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => equipItem(id as EquipmentType)}
                                                                className={cn(
                                                                    "min-w-[80px]",
                                                                    equipped
                                                                        ? "bg-slate-600 hover:bg-slate-500"
                                                                        : "bg-emerald-600 hover:bg-emerald-500"
                                                                )}
                                                            >
                                                                {equipped ? "Unequip" : "Equip"}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                disabled={!canAfford}
                                                                onClick={() => handleBuyEquipment(id as EquipmentType)}
                                                                className={cn(
                                                                    "min-w-[80px]",
                                                                    canAfford
                                                                        ? "bg-amber-600 hover:bg-amber-500"
                                                                        : "bg-slate-700 text-slate-400"
                                                                )}
                                                            >
                                                                {canAfford ? "Buy" : <Lock className="w-4 h-4" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                            <p className="text-xs text-slate-400 text-center">
                                Rest at the bonfire to bank your XP and protect it from death
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
