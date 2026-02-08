'use client';

import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { Task, TaskType } from '@/types';

interface TaskColumnProps {
    title: string;
    tasks: Task[];
    type: TaskType;
    placeholder: string;
}

export function TaskColumn({ title, tasks, type, placeholder }: TaskColumnProps) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);
    const { addTask } = useGameStore();

    const typeColors = {
        habit: 'border-t-primary',
        daily: 'border-t-accent',
        todo: 'border-t-success',
    };

    const handleAddTask = () => {
        if (newTaskTitle.trim()) {
            addTask(type, newTaskTitle.trim());
            setNewTaskTitle('');
            setIsInputVisible(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTask();
        } else if (e.key === 'Escape') {
            setNewTaskTitle('');
            setIsInputVisible(false);
        }
    };

    return (
        <div className={`flex flex-col bg-card rounded-lg border border-border ${typeColors[type]} border-t-4 shadow-sm`}>
            {/* Column Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>

            {/* Add Task Input */}
            <div className="p-3 border-b border-border">
                {isInputVisible ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            autoFocus
                            className="flex-1 px-3 py-2 rounded-md bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                            onClick={handleAddTask}
                            disabled={!newTaskTitle.trim()}
                            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsInputVisible(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        {placeholder}
                    </button>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[60vh]">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm">These are your {title}</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard key={task.id} task={task} compact />
                    ))
                )}
            </div>
        </div>
    );
}
