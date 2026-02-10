'use client';

import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X, Plus, Minus, Coins, MoreVertical, Calendar, ListChecks, ChevronDown, ChevronRight, Square, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { playSuccessSound } from '@/lib/sounds';
import { useState } from 'react';
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import type { Task } from '@/types';
import { CATEGORY_INFO } from '@/types/categories';
import { cn } from '@/lib/utils';

// Map category text colors to border colors for left accent
const CATEGORY_BORDER_COLOR: Record<string, string> = {
    productivity: 'border-l-blue-400',
    sports: 'border-l-green-400',
    fitness: 'border-l-red-400',
    self_care: 'border-l-pink-400',
    creativity: 'border-l-purple-400',
    social: 'border-l-yellow-400',
};
import { TaskEditModal } from './TaskEditModal';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
}

// Format due date Habitica-style
function formatDueDate(dateStr: string): { text: string; color: string } {
    const date = new Date(dateStr);
    const now = new Date();

    if (isPast(date) && !isToday(date)) {
        return { text: format(date, 'MMM d'), color: 'text-red-400' };
    }
    if (isToday(date)) {
        return { text: 'Today', color: 'text-amber-400' };
    }
    if (isTomorrow(date)) {
        return { text: 'Tomorrow', color: 'text-yellow-400' };
    }
    if (isThisWeek(date)) {
        return { text: format(date, 'EEEE'), color: 'text-blue-400' };
    }
    return { text: format(date, 'MMM d'), color: 'text-slate-400' };
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
    const { soundEnabled, completeTask, failTask, updateTask, deleteTask, toggleChecklistItem } = useGameStore();
    const isCompleted = task.completed ?? false;
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [showReward, setShowReward] = useState(false);

    // Fallback for tasks without category (legacy data)
    const category = task.category || 'productivity';
    const categoryInfo = CATEGORY_INFO[category];

    // Checklist progress
    const checklistTotal = task.checklist?.length || 0;
    const checklistDone = task.checklist?.filter((item) => item.completed).length || 0;
    const hasChecklist = checklistTotal > 0;

    // Due date formatting
    const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

    const handlePositive = () => {
        // Don't allow completion if there's a checklist with incomplete items
        if (hasChecklist && checklistDone < checklistTotal) {
            // Open checklist instead
            setIsChecklistOpen(true);
            return;
        }

        completeTask(task.type, task.id);
        playSuccessSound(soundEnabled);

        // Fire confetti
        const rect = document.getElementById(`task-${task.id}`)?.getBoundingClientRect();
        if (rect) {
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 20,
                spread: 50,
                origin: { x, y },
                colors: ['#10b981', '#3b82f6', '#8b5cf6'],
                scalar: 0.6,
                ticks: 80,
            });
        }

        // Store handles marking task.completed = true

        // Show floating reward text
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1200);
    };

    const handleNegative = () => {
        failTask(task.type, task.id);
    };

    const handleSave = (updates: Partial<Task>) => {
        updateTask(task.type, task.id, updates);
    };

    const handleDelete = () => {
        deleteTask(task.type, task.id);
    };

    const handleToggleChecklistItem = (itemId: string) => {
        toggleChecklistItem(task.type, task.id, itemId);
    };

    // Compact layout (Main Board View) - Redesigned for "Cool UI"
    if (compact) {
        return (
            <>
                <motion.div
                    id={`task-${task.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{
                        opacity: isCompleted ? 0.6 : 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => setIsEditOpen(true)}
                    className={cn(
                        "relative group grid grid-cols-[auto_1fr_auto] gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)]",
                        "bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]",
                        "shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]",
                        "transition-all duration-200 cursor-pointer",
                        "border-l-[3px]",
                        CATEGORY_BORDER_COLOR[category] || 'border-l-slate-500',
                        isCompleted && "opacity-50 bg-[var(--surface-0)] border-dashed grayscale-[0.5]"
                    )}
                >
                    {/* Floating reward notification */}
                    <AnimatePresence>
                        {showReward && (
                            <motion.div
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 0, y: -40 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="absolute top-0 right-3 z-20 pointer-events-none flex items-center gap-2"
                            >
                                <span className="text-sm font-bold text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
                                    +{task.baseSouls || 5} Souls
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Left: Action Button (Check/Plus/Minus) */}
                    <div className="flex flex-col items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {task.type === 'habit' ? (
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handlePositive}
                                    className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--surface-0)] text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors border border-[var(--border-subtle)] hover:border-emerald-600 shadow-sm"
                                    title="Good Habit (+)"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNegative}
                                    className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--surface-0)] text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border border-[var(--border-subtle)] hover:border-rose-600 shadow-sm"
                                    title="Bad Habit (-)"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handlePositive}
                                disabled={isCompleted || (hasChecklist && checklistDone < checklistTotal)}
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] transition-all border-2 shadow-sm",
                                    isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : hasChecklist && checklistDone < checklistTotal
                                            ? "bg-[var(--surface-0)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-50"
                                            : "bg-[var(--surface-1)] border-[var(--border-strong)] text-transparent hover:border-emerald-400 hover:bg-[var(--surface-2)]"
                                )}
                            >
                                <Check className={cn("w-5 h-5", !isCompleted && "opacity-0")} />
                            </button>
                        )}
                    </div>

                    {/* Middle: Content */}
                    <div className="flex flex-col justify-center min-w-0">
                        {/* Title */}
                        <h3 className={cn(
                            "text-sm font-semibold truncate leading-tight mb-1 text-[var(--text-primary)]",
                            isCompleted && "line-through text-[var(--text-muted)]"
                        )}>
                            {task.title}
                        </h3>

                        {/* Meta Row */}
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                            {/* Souls Reward */}
                            <span className="flex items-center gap-1 font-medium text-[var(--text-faint)]">
                                <Coins className="w-3 h-3 text-amber-400" />
                                <span className="group-hover:text-amber-400 transition-colors">{task.baseSouls || 5}</span>
                            </span>

                            {/* Separator */}
                            <span className="text-[var(--border-strong)]">•</span>

                            {/* Due Date (Todos) */}
                            {task.type === 'todo' && dueDateInfo && (
                                <span className={cn("flex items-center gap-1 font-medium", dueDateInfo.color)}>
                                    <Calendar className="w-3 h-3" />
                                    <span>{dueDateInfo.text}</span>
                                </span>
                            )}

                            {/* Checklist */}
                            {hasChecklist && (
                                <span className={cn(
                                    "flex items-center gap-1 font-medium",
                                    checklistDone === checklistTotal ? "text-emerald-400" : "text-[var(--text-muted)]"
                                )}>
                                    <ListChecks className="w-3 h-3" />
                                    <span>{checklistDone}/{checklistTotal}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right: Menu / More Actions */}
                    <div className="flex items-start justify-end" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] rounded-md transition-all"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Checklist Expansion (if any) - Optional: Render below if expanded */}
                </motion.div>

                {/* Edit Modal */}
                <TaskEditModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    task={task}
                    taskType={task.type}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            </>
        );
    }

    // Standard/Full Layout (Unused in board but kept for safe compilation for now)
    return null;
}
