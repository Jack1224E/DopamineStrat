'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Reward } from '@/types';

interface RewardEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: Reward;
    onSave: (updatedReward: Partial<Reward>) => void;
    onDelete: () => void;
}

export function RewardEditModal({
    isOpen,
    onClose,
    reward,
    onSave,
    onDelete
}: RewardEditModalProps) {
    const [title, setTitle] = useState(reward.title);
    const [cost, setCost] = useState(reward.cost);
    const [notes, setNotes] = useState(reward.notes || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reset state when reward changes
    useEffect(() => {
        setTitle(reward.title);
        setCost(reward.cost);
        setNotes(reward.notes || '');
        setShowDeleteConfirm(false);
    }, [reward]);

    const handleSave = () => {
        onSave({
            title,
            cost: Number(cost),
            notes: notes || undefined,
        });
        onClose();
    };

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete();
            onClose();
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative z-10 w-full max-w-md",
                            "bg-gradient-to-br from-slate-900 to-slate-800",
                            "rounded-2xl border border-slate-700",
                            "shadow-2xl max-h-[90vh] overflow-y-auto"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Coins className="w-5 h-5 text-amber-500" />
                                Edit Reward
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Title*
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg",
                                        "bg-slate-800 border border-slate-600",
                                        "text-white placeholder-slate-500",
                                        "focus:outline-none focus:border-amber-500"
                                    )}
                                    placeholder="Reward title (e.g., Play Game)"
                                />
                            </div>

                            {/* Cost */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Cost (Souls)*
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={(e) => setCost(Number(e.target.value))}
                                        min="0"
                                        className={cn(
                                            "w-full pl-9 pr-3 py-2 rounded-lg",
                                            "bg-slate-800 border border-slate-600",
                                            "text-white placeholder-slate-500",
                                            "focus:outline-none focus:border-amber-500"
                                        )}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg resize-none",
                                        "bg-slate-800 border border-slate-600",
                                        "text-white placeholder-slate-500",
                                        "focus:outline-none focus:border-amber-500"
                                    )}
                                    placeholder="Add notes..."
                                />
                            </div>
                        </div>

                        {/* Footer with Delete */}
                        <div className="p-4 border-t border-slate-700">
                            <Button
                                variant={showDeleteConfirm ? "destructive" : "ghost"}
                                onClick={handleDelete}
                                className={cn(
                                    "w-full",
                                    !showDeleteConfirm && "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                )}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {showDeleteConfirm ? 'Confirm Delete?' : 'Delete Reward'}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
