'use client';

import { StatsBar } from '@/components/layout/StatsBar';
import { TaskColumn } from '@/components/task/TaskColumn';
import { useGameStore } from '@/store/gameStore';

export default function TodayPage() {
    const { habits, dailies, todos } = useGameStore();

    return (
        <div className="min-h-screen bg-background">
            {/* Stats Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <StatsBar />
                </div>
            </div>

            {/* Task Columns - Horizontal Layout */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>
            </main>
        </div>
    );
}
