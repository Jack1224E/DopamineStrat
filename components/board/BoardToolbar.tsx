'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Plus, X } from 'lucide-react';
import { useBoardFilters } from '@/hooks/useBoardFilters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TaskEditModal } from '@/components/task/TaskEditModal';
import { useGameStore } from '@/store/gameStore';
import type { Task } from '@/types';

import { CategoryFilter } from '@/components/board/CategoryFilter';

export function BoardToolbar() {
    const { filters, searchQuery, setSearch, setCategories, setSort, clearFilters, activeCount } = useBoardFilters();
    const { addTask } = useGameStore();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Global shortcut listener for '/' and 'A'
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input is focused
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === '/' && !isSearchFocused) {
                e.preventDefault();
                inputRef.current?.focus();
            }

            if ((e.key === 'a' || e.key === 'A') && !isTaskModalOpen) {
                e.preventDefault();
                setIsTaskModalOpen(true);
            }

            if (e.key === 'Escape') {
                if (isSearchFocused) {
                    inputRef.current?.blur();
                } else if (filters.search || filters.categories.length > 0) {
                    clearFilters();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchFocused, isTaskModalOpen, filters, clearFilters]);

    const handleCreateTask = (taskData: Partial<Task>) => {
        if (taskData.title) {
            addTask('todo', taskData.title, taskData);
            setIsTaskModalOpen(false);
        }
    };

    return (
        <>
            <div className="sticky top-0 z-30 mb-6 py-4 bg-[var(--surface-0)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] transition-all">
                <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* Left: Search & Filters */}
                    <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-2xl">
                        {/* Search Bar */}
                        <div className={cn(
                            "relative flex-1 group transition-all duration-200",
                            isSearchFocused ? "scale-[1.01]" : ""
                        )}>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder="Search tasks..."
                                className={cn(
                                    "w-full pl-9 pr-10 py-2.5 rounded-[var(--radius-md)]",
                                    "bg-[var(--surface-1)] border border-[var(--border-subtle)]",
                                    "text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
                                    "focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]",
                                    "transition-all shadow-sm"
                                )}
                            />
                            {/* Clear Button or Shortcut Hint */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                {searchQuery ? (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="p-1 rounded-full hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                ) : (
                                    <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-muted)] opacity-50">
                                        <span className="text-xs">/</span>
                                    </kbd>
                                )}
                            </div>
                        </div>

                        <CategoryFilter
                            selectedCategories={filters.categories}
                            onSelectCategory={(category) => {
                                const newCategories = filters.categories.includes(category)
                                    ? filters.categories.filter(c => c !== category)
                                    : [...filters.categories, category];
                                setCategories(newCategories);
                            }}
                        />

                        {/* Sort Button */}
                        <Button
                            variant="ghost"
                            className="h-10 px-3 gap-2 border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                            onClick={() => {
                                const nextSort = filters.sort === 'created' ? 'priority' : filters.sort === 'priority' ? 'due' : 'created';
                                setSort(nextSort);
                            }}
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline capitalize">{filters.sort}</span>
                        </Button>
                    </div>

                    {/* Right: Add Task */}
                    <Button
                        size="lg"
                        onClick={() => setIsTaskModalOpen(true)}
                        className={cn(
                            "w-full md:w-auto h-10 px-6 gap-2",
                            "bg-[var(--primary)] text-[var(--primary-foreground)]",
                            "hover:bg-[var(--primary)]/90 shadow-[var(--shadow-glow)]",
                            "font-semibold tracking-wide"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Task</span>
                        <kbd className="hidden md:inline-flex ml-2 h-5 items-center justify-center rounded bg-black/20 px-1.5 font-mono text-[10px] font-medium text-white/70">
                            A
                        </kbd>
                    </Button>
                </div>
            </div >

            {/* Task Creation Modal */}
            < TaskEditModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)
                }
                task={{ id: '', title: '', type: 'todo' } as Task} // Empty task for creation
                taskType="todo"
                onSave={handleCreateTask}
                onDelete={() => { }} // No-op for creation
            />
        </>
    );
}
