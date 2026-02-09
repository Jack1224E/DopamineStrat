'use client';

import Link from 'next/link';
import { StatsBar } from '@/components/layout/StatsBar';
import { TaskColumn } from '@/components/task/TaskColumn';
import { RewardColumn } from '@/components/game/RewardColumn';
import { DeathScreen } from '@/components/game/DeathScreen';
import { useGameStore } from '@/store/gameStore';
import { BookOpen, History as HistoryIcon } from 'lucide-react';

export default function TodayPage() {
    const { habits, dailies, todos } = useGameStore();

    return (
        <>
            {/* Death Screen Overlay */}
            <DeathScreen />

            <div className="min-h-screen bg-background">
                {/* Page Header with Rules Link */}
                <header className="border-b border-border bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            ⚔️ Dopamine Strategy
                        </h1>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/history"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 transition-all text-sm text-slate-300 hover:text-amber-400"
                            >
                                <HistoryIcon className="w-4 h-4" />
                                History
                            </Link>
                            <Link
                                href="/rules"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 transition-all text-sm text-slate-300 hover:text-amber-400"
                            >
                                <BookOpen className="w-4 h-4" />
                                Rules
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Stats Header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <StatsBar />
                    </div>
                </div>

                {/* Task Columns - Horizontal Layout */}
                <main className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                        <TaskColumn
                            title="Habits"
                            tasks={habits}
                            type="habit"
                            placeholder="Add a Habit"
                        />

                        <TaskColumn
                            title="Dailies"
                            tasks={dailies}
                            type="daily"
                            placeholder="Add a Daily"
                        />

                        <TaskColumn
                            title="To Do's"
                            tasks={todos}
                            type="todo"
                            placeholder="Add a To Do"
                        />

                        <RewardColumn />
                    </div>
                </main>
            </div>
        </>
    );
}
