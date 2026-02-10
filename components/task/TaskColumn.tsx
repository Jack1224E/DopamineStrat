'use client';

import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import type { Task, TaskType } from '@/types';

interface TaskColumnProps {
    title: string;
    tasks: Task[];
    type: TaskType;
    placeholder: string;
}

export function TaskColumn({ title, tasks, type, placeholder }: TaskColumnProps) {
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);
    const { addTask } = useGameStore();

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

    // Filter tasks based on active tab
    const filteredTasks = tasks.filter(task => {
        if (type === 'habit') return true; // Habits are always active
        if (activeTab === 'active') return !task.completed;
        if (activeTab === 'completed') return task.completed;
        return true;
    });

    const counts = {
        active: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length,
        all: tasks.length
    };

    const tabs = type === 'habit'
        ? []
        : [
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'completed', label: 'Done', count: counts.completed }
        ];

    return (
        <div className="flex flex-col h-full bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-sm overflow-hidden transition-all hover:border-[var(--border-strong)]">
            {/* Column Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                        {title}
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-[var(--surface-3)] text-[var(--text-muted)]">
                            {tasks.length}
                        </span>
                    </h2>
                </div>

                {/* Tabs (Only for Dailies/Todos) */}
                {tabs.length > 0 && (
                    <div className="flex p-1 gap-1 bg-[var(--surface-0)]/50 rounded-[var(--radius-md)]">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all",
                                    activeTab === tab.id
                                        ? "bg-green-500/15 text-green-400 font-bold shadow-sm border border-green-500/20"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-[var(--surface-2)]/50"
                                )}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[10px]",
                                        activeTab === tab.id ? "bg-green-500/20 text-green-400 font-bold" : "bg-[var(--surface-0)] text-slate-400"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Task Input */}
            <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--surface-0)]/30">
                {isInputVisible ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            autoFocus
                            className="flex-1 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface-0)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                        />
                        <button
                            onClick={handleAddTask}
                            disabled={!newTaskTitle.trim()}
                            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Add
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsInputVisible(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-emerald-500/5 hover:bg-emerald-500/10 border border-dashed border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400/70 hover:text-emerald-400 transition-all text-sm font-medium group"
                    >
                        <Plus className="w-4 h-4 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-200" />
                        {placeholder}
                    </button>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[60vh] min-h-[300px] scrollbar-thin scrollbar-thumb-[var(--border-strong)] scrollbar-track-transparent">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-[var(--text-faint)] animate-in fade-in duration-500">
                        <div className="w-16 h-16 rounded-full bg-[var(--surface-0)] flex items-center justify-center mb-3">
                            <Plus className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">No {activeTab === 'active' ? 'active' : 'completed'} tasks</p>
                        <p className="text-xs opacity-70">Add one above to get started</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TaskCard task={task} compact />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
