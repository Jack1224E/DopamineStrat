'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ArrowLeft, Filter, CheckCircle2, XCircle, Plus, Minus, Coins, History as HistoryIcon, Calendar } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { CATEGORY_INFO } from '@/types/categories';
import { cn } from '@/lib/utils';
import type { HistoryEntry } from '@/store/gameStore';
import type { TaskType } from '@/types';

export default function HistoryPage() {
    const { history } = useGameStore();
    const [filterType, setFilterType] = useState<TaskType | 'all'>('all');

    // Filter and Sort History
    const filteredHistory = useMemo(() => {
        let sorted = [...history].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        if (filterType !== 'all') {
            sorted = sorted.filter(entry => entry.taskType === filterType);
        }

        return sorted;
    }, [history, filterType]);

    // Group by Date
    const groupedHistory = useMemo(() => {
        const groups: Record<string, HistoryEntry[]> = {};

        filteredHistory.forEach(entry => {
            const date = parseISO(entry.timestamp);
            const dateKey = format(date, 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(entry);
        });

        return groups;
    }, [filteredHistory]);

    // Stats
    const totalSouls = history.reduce((sum, entry) => sum + (entry.soulsEarned || 0), 0);
    const totalCompleted = history.filter(h => h.action === 'completed' || h.action === 'positive').length;

    // Date Header Helper
    const getDateLabel = (dateKey: string) => {
        const date = parseISO(dateKey);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/today"
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <HistoryIcon className="w-5 h-5 text-amber-500" />
                            History Log
                        </h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Tasks Done</div>
                            <div className="text-xl font-bold text-foreground">{totalCompleted}</div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Coins className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Souls Earned</div>
                            <div className="text-xl font-bold text-foreground">{totalSouls}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                    {(['all', 'habit', 'daily', 'todo'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => { setFilterType(type); }}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                filterType === type
                                    ? "bg-amber-500 text-white"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-card/80"
                            )}
                        >
                            {type === 'all' ? 'All Activity' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="space-y-8">
                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No history recorded yet.</p>
                            <p className="text-sm opacity-60">Complete some tasks to see them here!</p>
                        </div>
                    ) : (
                        Object.entries(groupedHistory).map(([dateKey, entries]) => (
                            <div key={dateKey} className="relative">
                                {/* Date Header */}
                                <div className="sticky top-16 z-0 flex items-center gap-4 mb-4">
                                    <div className="h-px flex-1 bg-border"></div>
                                    <span className="text-xs font-semibold text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                                        {getDateLabel(dateKey)}
                                    </span>
                                    <div className="h-px flex-1 bg-border"></div>
                                </div>

                                {/* Entries */}
                                <div className="space-y-3 pl-4 border-l-2 border-border/50 ml-4 pb-4">
                                    {entries.map((entry) => {
                                        const categoryInfo = CATEGORY_INFO[entry.category] || CATEGORY_INFO['productivity'];
                                        const timeLabel = format(parseISO(entry.timestamp), 'h:mm a');

                                        return (
                                            <motion.div
                                                key={entry.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="relative bg-card border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                                            >
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border-2 border-slate-600 ring-4 ring-background" />

                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        {/* Action Icon */}
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                                            entry.action === 'failed' || entry.action === 'negative'
                                                                ? "bg-red-500/10 text-red-500"
                                                                : "bg-emerald-500/10 text-emerald-500"
                                                        )}>
                                                            {entry.action === 'positive' && <Plus className="w-4 h-4" />}
                                                            {entry.action === 'negative' && <Minus className="w-4 h-4" />}
                                                            {entry.action === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                                                            {entry.action === 'failed' && <XCircle className="w-4 h-4" />}
                                                        </div>

                                                        <div>
                                                            <div className="font-medium text-foreground text-sm">
                                                                {entry.taskTitle}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={cn("text-xs flex items-center gap-1", categoryInfo.color)}>
                                                                    {categoryInfo.emoji} {categoryInfo.label}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">• {timeLabel}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rewards */}
                                                    <div className="text-right shrink-0">
                                                        {entry.soulsEarned && entry.soulsEarned > 0 && (
                                                            <div className="flex items-center gap-1 text-cyan-400 font-medium text-sm">
                                                                +{entry.soulsEarned} <Coins className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
