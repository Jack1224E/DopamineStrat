'use client';

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { playSuccessSound } from '@/lib/sounds';
import { useState } from 'react';
import type { Task } from '@/types';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
    const { gainXp, loseHp, soundEnabled, completeTask } = useGameStore();
    const [isCompleted, setIsCompleted] = useState(false);

    const handlePositive = () => {
        gainXp(task.xpReward);
        playSuccessSound(soundEnabled);

        // Fire confetti for non-habits or first habit completion
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
            if (task.type === 'todo') {
                // Remove todo after animation
                setTimeout(() => {
                    completeTask(task.type, task.id);
                }, 500);
            }
        }
    };

    const handleNegative = () => {
        loseHp(task.hpPenalty);
    };

    // Compact layout for column view (Habitica-style)
    if (compact) {
        return (
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
                className={`
          relative flex items-center gap-2 p-3 rounded-md bg-background border border-border
          hover:bg-muted/50 transition-colors
        `}
            >
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
                            className={`h-8 w-8 p-0 shrink-0 rounded-sm border-2 transition-all ${isCompleted
                                    ? 'bg-success border-success text-success-foreground'
                                    : 'border-muted-foreground/30 hover:border-success hover:bg-success/10'
                                }`}
                        >
                            {isCompleted && <Check className="w-4 h-4" />}
                        </Button>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {task.title}
                            </p>
                        </div>
                    </>
                )}
            </motion.div>
        );
    }

    // Full layout (original)
    const typeColors = {
        habit: 'border-l-primary',
        daily: 'border-l-accent',
        todo: 'border-l-success',
    };

    const typeLabels = {
        habit: 'Habit',
        daily: 'Daily',
        todo: 'To-Do',
    };

    return (
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
                scale: { duration: 0.3, times: [0, 0.5, 1] }
            }}
            className={`
        relative p-4 rounded-lg border-l-4 bg-card border border-border
        shadow-sm hover:shadow-md transition-shadow
        ${typeColors[task.type]}
        ${isCompleted ? 'pointer-events-none' : ''}
      `}
        >
            {/* Type badge */}
            <span className="absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                {typeLabels[task.type]}
            </span>

            {/* Content */}
            <div className="pr-16">
                <h3 className={`font-semibold text-foreground ${isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                </h3>
                {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Stats and actions */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-success">
                        +{task.xpReward} XP
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                        -{task.hpPenalty} HP
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleNegative}
                        disabled={isCompleted}
                        className="text-destructive hover:bg-destructive/10"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={handlePositive}
                        disabled={isCompleted}
                        className="bg-success text-success-foreground hover:bg-success/90"
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Completion overlay */}
            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-success/10"
                >
                    <Check className="w-8 h-8 text-success" />
                </motion.div>
            )}
        </motion.div>
    );
}
