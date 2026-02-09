'use client';

import Link from 'next/link';

import { StatsBar } from '@/components/layout/StatsBar';
import { TaskColumn } from '@/components/task/TaskColumn';
import { RewardColumn } from '@/components/game/RewardColumn';
import { DeathScreen } from '@/components/game/DeathScreen';
import { BoardToolbar } from '@/components/board/BoardToolbar';
import { useBoardFilters } from '@/hooks/useBoardFilters';
import { useGameStore } from '@/store/gameStore';
import { BookOpen, History as HistoryIcon } from 'lucide-react';
import type { Task, Reward } from '@/types';



import { FlaskShop } from '@/components/game/FlaskShop';
import { useState } from 'react';

export function TodayBoard() {
    const { habits, dailies, todos } = useGameStore();
    const { filters } = useBoardFilters();
    const [showShop, setShowShop] = useState(false);

    // Helper to filter and sort tasks
    const processTasks = <T extends Task | Reward>(items: T[], type: 'task' | 'reward') => {
        let result = [...items];

        // 1. Search Filter
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(q) ||
                (item.notes && item.notes.toLowerCase().includes(q))
            );
        }

        // 2. Category Filter
        if (filters.categories.length > 0) {
            result = result.filter(item => {
                // Task has category, Reward likely doesn't (default to self_care or null)
                const cat = (item as Task).category;
                if (cat) return filters.categories.includes(cat);

                // For rewards or items without category, maybe we default to 'self_care'?
                // Or we separate Rewards logic. For now, assume Rewards are self_care.
                return filters.categories.includes('self_care');
            });
        }

        // 3. Sort
        result.sort((a, b) => {
            switch (filters.sort) {
                case 'alpha':
                    return a.title.localeCompare(b.title);
                case 'priority':
                    // Priority sort: Hard > Medium > Easy > Trivial
                    if (type === 'task') {
                        const difficultyOrder = { hard: 3, medium: 2, easy: 1, trivial: 0 };
                        const taskA = a as Task;
                        const taskB = b as Task;
                        return (difficultyOrder[taskB.difficulty || 'easy'] || 0) - (difficultyOrder[taskA.difficulty || 'easy'] || 0);
                    }
                    return 0; // Rewards don't have difficulty
                case 'due':
                    if (type === 'task') {
                        const taskA = a as Task;
                        const taskB = b as Task;
                        // Put tasks with due dates first, then sort by date
                        if (!taskA.dueDate && !taskB.dueDate) return 0;
                        if (!taskA.dueDate) return 1;
                        if (!taskB.dueDate) return -1;
                        return new Date(taskA.dueDate).getTime() - new Date(taskB.dueDate).getTime();
                    }
                    return 0;
                case 'created':
                default:
                    // Assuming ID contains timestamp or just stable order
                    return b.id.localeCompare(a.id); // Newest first
            }
        });

        return result;
    };

    const filteredHabits = processTasks(habits, 'task') as Task[];
    const filteredDailies = processTasks(dailies, 'task') as Task[];
    const filteredTodos = processTasks(todos, 'task') as Task[];
    const { rewards } = useGameStore(); // Need to get rewards from store to filter them
    const filteredRewards = processTasks(rewards, 'reward') as Reward[];

    // We assume filteredRewards works similarly if we pass them to RewardColumn
    // But RewardColumn currently reads from store directly. 
    // We need to update RewardColumn to accept props or filter inside it.
    // For Phase 1, let's just modify RewardColumn to accept tasks? 
    // No, RewardColumn uses `useGameStore`. 
    // I should modify RewardColumn to accept `rewards` prop, OR
    // I should pass the filter context to RewardColumn?
    // Proper way: Lift state up. RewardColumn should accept `rewards` prop.
    // But RewardColumn is not imported here as a component with props?
    // Let's check RewardColumn. It takes no props.
    // Refactor RewardColumn to take `rewards` prop.

    return (
        <>
            {/* ... Existing JSX ... */}

            <div className="min-h-screen bg-[var(--surface-0)]">
                {/* ... Header ... */}

                {/* Stats Header */}
                <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-1)]/50 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <StatsBar onShopClick={() => setShowShop(true)} />
                    </div>
                </div>

                {/* Toolbar */}
                <BoardToolbar />

                {/* Task Columns - Horizontal Layout */}
                <main className="container mx-auto px-4 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                        <TaskColumn
                            title="Habits"
                            tasks={filteredHabits}
                            type="habit"
                            placeholder="Add a Habit"
                        />

                        <TaskColumn
                            title="Dailies"
                            tasks={filteredDailies}
                            type="daily"
                            placeholder="Add a Daily"
                        />

                        <TaskColumn
                            title="To Do's"
                            tasks={filteredTodos}
                            type="todo"
                            placeholder="Add a To Do"
                        />

                        {/* We need to refactor RewardColumn to accept rewards prop. 
                            For now, I'll update RewardColumn separately. 
                            But to propagate filters I must update it now.
                        */}
                        <RewardColumn rewards={filteredRewards} />
                    </div>
                </main>
            </div>
            {/* Render Shop here to avoid stacking context issues */}
            <FlaskShop isOpen={showShop} onClose={() => setShowShop(false)} />
        </>
    );
}
