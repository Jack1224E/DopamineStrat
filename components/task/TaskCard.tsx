'use client';

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X, Plus, Minus, Coins, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { playSuccessSound } from '@/lib/sounds';
import { useState } from 'react';
import type { Task } from '@/types';
import { CATEGORY_INFO } from '@/types/categories';
import { cn } from '@/lib/utils';
import { TaskEditModal } from './TaskEditModal';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
    const { soundEnabled, completeTask, failTask, updateTask, deleteTask } = useGameStore();
    const [isCompleted, setIsCompleted] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Fallback for tasks without category (legacy data)
    const category = task.category || 'productivity';
    const categoryInfo = CATEGORY_INFO[category];

    const handlePositive = () => {
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

        // For todos/dailies, mark as completed
        if (task.type !== 'habit') {
            setIsCompleted(true);
        }
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

    // Compact layout for column view (Habitica-style)
    if (compact) {
        return (
            <>
                <motion.div
                    id={`task-${task.id}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isCompleted ? 0.5 : 1,
                        y: 0,
                    }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "relative flex items-center gap-2 p-3 rounded-md bg-background border border-border group",
                        "hover:bg-muted/50 transition-colors"
                    )}
                >
                    {/* Category emoji */}
                    <span className="text-sm" title={categoryInfo.label}>
                        {categoryInfo.emoji}
                    </span>

                    {/* Plus/Minus buttons for habits, Check for others */}
                    {task.type === 'habit' ? (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handlePositive}
                                className="h-8 w-8 p-0 text-success hover:bg-success/20 hover:text-success shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">
                                    {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Coins className="w-3 h-3 text-cyan-400" />
                                    <span className="text-cyan-400">{task.baseSouls || 5}</span>
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleNegative}
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/20 hover:text-destructive shrink-0"
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handlePositive}
                                disabled={isCompleted}
                                className={cn(
                                    "h-8 w-8 p-0 shrink-0 rounded-sm border-2 transition-all",
                                    isCompleted
                                        ? 'bg-success border-success text-success-foreground'
                                        : 'border-muted-foreground/30 hover:border-success hover:bg-success/10'
                                )}
                            >
                                {isCompleted && <Check className="w-4 h-4" />}
                            </Button>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                )}>
                                    {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Coins className="w-3 h-3 text-cyan-400" />
                                    <span className="text-cyan-400">{task.baseSouls || 5}</span>
                                </p>
                            </div>
                        </>
                    )}

                    {/* 3-dot menu button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditOpen(true)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
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

    // Full layout (original)
    const typeColors = {
        habit: 'border-l-primary',
        daily: 'border-l-accent',
        todo: 'border-l-success',
    };

    return (
        <>
            <motion.div
                id={`task-${task.id}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: isCompleted ? 0.6 : 1,
                    y: 0,
                    scale: isCompleted ? [1, 1.05, 1] : 1,
                }}
                transition={{
                    duration: 0.3,
                    scale: { duration: 0.5 },
                }}
                className={cn(
                    "relative p-4 rounded-lg border-l-4",
                    "bg-card hover:bg-card/80 transition-colors",
                    "shadow-lg shadow-black/5",
                    typeColors[task.type],
                    isCompleted && 'opacity-60'
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Category tag */}
                        <div className={cn("text-xs font-medium mb-1", categoryInfo.color)}>
                            {categoryInfo.emoji} {categoryInfo.label}
                        </div>

                        {/* Title */}
                        <h3 className={cn(
                            "font-semibold text-lg leading-tight",
                            isCompleted && 'line-through opacity-70'
                        )}>
                            {task.title}
                        </h3>

                        {/* Description if any */}
                        {task.notes && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.notes}
                            </p>
                        )}

                        {/* Rewards */}
                        <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-cyan-400" />
                                <span className="text-cyan-400">{task.baseSouls || 5}</span>
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {/* 3-dot menu */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditOpen(true)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>

                        {task.type === 'habit' ? (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handlePositive}
                                    className="h-10 w-10 text-success hover:bg-success/20"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleNegative}
                                    className="h-10 w-10 text-destructive hover:bg-destructive/20"
                                >
                                    <Minus className="w-5 h-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handlePositive}
                                    disabled={isCompleted}
                                    className={cn(
                                        "h-10 w-10 rounded-full border-2 transition-all",
                                        isCompleted
                                            ? 'bg-success border-success text-success-foreground'
                                            : 'border-muted hover:border-success hover:bg-success/10 text-muted-foreground'
                                    )}
                                >
                                    <Check className="w-5 h-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleNegative}
                                    className="h-10 w-10 text-destructive hover:bg-destructive/20"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
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
