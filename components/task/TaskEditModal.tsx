'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import {
    X, Calendar, ChevronDown, Trash2, Plus, Check, Square, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task, TaskType, TaskDifficulty, TaskFrequency, ChecklistItem } from '@/types';
import { CATEGORY_INFO, type TaskCategory } from '@/types/categories';

// Import DayPicker styles
import 'react-day-picker/style.css';

interface TaskEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    taskType: TaskType;
    onSave: (updatedTask: Partial<Task>) => void;
    onDelete: () => void;
}

const DIFFICULTY_OPTIONS: { value: TaskDifficulty; label: string; emoji: string; color: string }[] = [
    { value: 'trivial', label: 'Trivial', emoji: '⭐', color: 'text-slate-400' },
    { value: 'easy', label: 'Easy', emoji: '⭐⭐', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', emoji: '⭐⭐⭐', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', emoji: '⭐⭐⭐⭐', color: 'text-red-400' },
];

const FREQUENCY_OPTIONS: { value: TaskFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_INFO).map(([key, info]) => ({
    value: key as TaskCategory,
    label: info.label,
    emoji: info.emoji,
    color: info.color,
}));

export function TaskEditModal({
    isOpen,
    onClose,
    task,
    taskType,
    onSave,
    onDelete
}: TaskEditModalProps) {
    const [title, setTitle] = useState(task.title);
    const [notes, setNotes] = useState(task.notes || '');
    const [category, setCategory] = useState<TaskCategory>(task.category || 'productivity');
    const [difficulty, setDifficulty] = useState<TaskDifficulty>(task.difficulty || 'easy');
    const [dueDate, setDueDate] = useState<Date | undefined>(
        task.dueDate ? new Date(task.dueDate) : undefined
    );
    const [frequency, setFrequency] = useState<TaskFrequency>(task.frequency || 'daily');
    const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || []);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Reset state when task changes
    useEffect(() => {
        setTitle(task.title);
        setNotes(task.notes || '');
        setCategory(task.category || 'productivity');
        setDifficulty(task.difficulty || 'easy');
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setFrequency(task.frequency || 'daily');
        setChecklist(task.checklist || []);
        setNewChecklistItem('');
    }, [task]);

    const handleSave = () => {
        onSave({
            title,
            notes: notes || undefined,
            category,
            difficulty,
            dueDate: dueDate ? dueDate.toISOString() : undefined,
            frequency: taskType === 'daily' ? frequency : undefined,
            checklist: taskType !== 'habit' && checklist.length > 0 ? checklist : undefined,
        });
        onClose();
    };

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete();
            onClose();
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => { setShowDeleteConfirm(false); }, 3000);
        }
    };

    const addChecklistItem = () => {
        if (newChecklistItem.trim()) {
            setChecklist([
                ...checklist,
                {
                    id: `cl-${Date.now()}`,
                    text: newChecklistItem.trim(),
                    completed: false,
                },
            ]);
            setNewChecklistItem('');
        }
    };

    const toggleChecklistItem = (id: string) => {
        setChecklist(
            checklist.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const removeChecklistItem = (id: string) => {
        setChecklist(checklist.filter((item) => item.id !== id));
    };

    const closeAllDropdowns = () => {
        setShowDatePicker(false);
        setShowCategoryDropdown(false);
        setShowDifficultyDropdown(false);
        setShowFrequencyDropdown(false);
    };

    const selectedCategory = CATEGORY_OPTIONS.find(c => c.value === category);
    const selectedDifficulty = DIFFICULTY_OPTIONS.find(d => d.value === difficulty);

    const getModalTitle = () => {
        const action = task.id ? 'Edit' : 'Create';
        switch (taskType) {
            case 'habit': return `${action} Habit`;
            case 'daily': return `${action} Daily`;
            case 'todo': return `${action} To Do`;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={closeAllDropdowns}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative z-10 w-full max-w-md",
                            "bg-gradient-to-br from-slate-900 to-slate-800",
                            "rounded-2xl border border-slate-700",
                            "shadow-2xl max-h-[90vh] overflow-y-auto"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-white">{getModalTitle()}</h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Title*
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value); }}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg",
                                        "bg-slate-800 border border-slate-600",
                                        "text-white placeholder-slate-500",
                                        "focus:outline-none focus:border-amber-500"
                                    )}
                                    placeholder="Task title"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => { setNotes(e.target.value); }}
                                    rows={3}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg resize-none",
                                        "bg-slate-800 border border-slate-600",
                                        "text-white placeholder-slate-500",
                                        "focus:outline-none focus:border-amber-500"
                                    )}
                                    placeholder="Add notes..."
                                />
                            </div>

                            {/* Category Dropdown */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Category
                                </label>
                                <div
                                    onClick={() => {
                                        setShowCategoryDropdown(!showCategoryDropdown);
                                        setShowDifficultyDropdown(false);
                                        setShowFrequencyDropdown(false);
                                        setShowDatePicker(false);
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer",
                                        "bg-slate-800 border border-slate-600",
                                        "text-white hover:border-slate-500"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{selectedCategory?.emoji}</span>
                                        <span className={selectedCategory?.color}>{selectedCategory?.label}</span>
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>

                                {showCategoryDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute z-20 w-full mt-1 py-1 rounded-lg bg-slate-800 border border-slate-600 shadow-xl"
                                    >
                                        {CATEGORY_OPTIONS.map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    setCategory(opt.value);
                                                    setShowCategoryDropdown(false);
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 flex items-center gap-2 cursor-pointer",
                                                    "hover:bg-slate-700",
                                                    category === opt.value && "bg-slate-700"
                                                )}
                                            >
                                                <span>{opt.emoji}</span>
                                                <span className={opt.color}>{opt.label}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Difficulty Dropdown */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Difficulty
                                </label>
                                <div
                                    onClick={() => {
                                        setShowDifficultyDropdown(!showDifficultyDropdown);
                                        setShowCategoryDropdown(false);
                                        setShowFrequencyDropdown(false);
                                        setShowDatePicker(false);
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer",
                                        "bg-slate-800 border border-slate-600",
                                        "text-white hover:border-slate-500"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={selectedDifficulty?.color}>{selectedDifficulty?.emoji}</span>
                                        <span>{selectedDifficulty?.label}</span>
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>

                                {showDifficultyDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute z-20 w-full mt-1 py-1 rounded-lg bg-slate-800 border border-slate-600 shadow-xl"
                                    >
                                        {DIFFICULTY_OPTIONS.map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    setDifficulty(opt.value);
                                                    setShowDifficultyDropdown(false);
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 flex items-center gap-2 cursor-pointer",
                                                    "hover:bg-slate-700",
                                                    difficulty === opt.value && "bg-slate-700"
                                                )}
                                            >
                                                <span className={opt.color}>{opt.emoji}</span>
                                                <span className="text-white">{opt.label}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Due Date (Todos only) */}
                            {taskType === 'todo' && (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Due Date
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => {
                                                setShowDatePicker(!showDatePicker);
                                                setShowCategoryDropdown(false);
                                                setShowDifficultyDropdown(false);
                                                setShowFrequencyDropdown(false);
                                            }}
                                            className={cn(
                                                "flex-1 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer",
                                                "bg-slate-800 border border-slate-600",
                                                "text-white hover:border-slate-500"
                                            )}
                                        >
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Select date...'}
                                        </div>
                                        {dueDate && (
                                            <div
                                                onClick={() => { setDueDate(undefined); }}
                                                className="p-2 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 cursor-pointer"
                                            >
                                                <X className="w-4 h-4 text-slate-400" />
                                            </div>
                                        )}
                                    </div>

                                    {showDatePicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute z-20 mt-1 rounded-lg bg-slate-800 border border-slate-600 shadow-xl p-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DayPicker
                                                mode="single"
                                                selected={dueDate}
                                                onSelect={(date) => {
                                                    setDueDate(date);
                                                    setShowDatePicker(false);
                                                }}
                                                disabled={{ before: new Date() }}
                                                className="text-white"
                                                classNames={{
                                                    day: 'text-white hover:bg-slate-700 rounded p-2',
                                                    selected: 'bg-amber-600 text-white',
                                                    today: 'text-amber-400 font-bold',
                                                    disabled: 'text-slate-600',
                                                    month_caption: 'text-white font-bold',
                                                    weekday: 'text-slate-400',
                                                    nav: 'text-white',
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Frequency (Dailies only) */}
                            {taskType === 'daily' && (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Frequency
                                    </label>
                                    <div
                                        onClick={() => {
                                            setShowFrequencyDropdown(!showFrequencyDropdown);
                                            setShowCategoryDropdown(false);
                                            setShowDifficultyDropdown(false);
                                            setShowDatePicker(false);
                                        }}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer",
                                            "bg-slate-800 border border-slate-600",
                                            "text-white hover:border-slate-500"
                                        )}
                                    >
                                        <span>{FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label}</span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>

                                    {showFrequencyDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute z-20 w-full mt-1 py-1 rounded-lg bg-slate-800 border border-slate-600 shadow-xl"
                                        >
                                            {FREQUENCY_OPTIONS.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setFrequency(opt.value);
                                                        setShowFrequencyDropdown(false);
                                                    }}
                                                    className={cn(
                                                        "w-full px-3 py-2 cursor-pointer text-white",
                                                        "hover:bg-slate-700",
                                                        frequency === opt.value && "bg-slate-700"
                                                    )}
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Checklist (Dailies and Todos only) */}
                            {taskType !== 'habit' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Checklist
                                    </label>

                                    {/* Existing items */}
                                    {checklist.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {checklist.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700"
                                                >
                                                    <div
                                                        onClick={() => { toggleChecklistItem(item.id); }}
                                                        className="cursor-pointer"
                                                    >
                                                        {item.completed ? (
                                                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "flex-1 text-sm",
                                                            item.completed
                                                                ? "line-through text-slate-500"
                                                                : "text-white"
                                                        )}
                                                    >
                                                        {item.text}
                                                    </span>
                                                    <div
                                                        onClick={() => { removeChecklistItem(item.id); }}
                                                        className="p-1 rounded hover:bg-slate-700 cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add new item */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newChecklistItem}
                                            onChange={(e) => { setNewChecklistItem(e.target.value); }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addChecklistItem();
                                                }
                                            }}
                                            className={cn(
                                                "flex-1 px-3 py-2 rounded-lg",
                                                "bg-slate-800 border border-slate-600",
                                                "text-white placeholder-slate-500 text-sm",
                                                "focus:outline-none focus:border-amber-500"
                                            )}
                                            placeholder="Add checklist item..."
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={addChecklistItem}
                                            disabled={!newChecklistItem.trim()}
                                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Delete - Only show if editing existing task */}
                        {task.id && (
                            <div className="p-4 border-t border-slate-700">
                                <Button
                                    variant={showDeleteConfirm ? "destructive" : "ghost"}
                                    onClick={handleDelete}
                                    className={cn(
                                        "w-full",
                                        !showDeleteConfirm && "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    )}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {showDeleteConfirm ? 'Confirm Delete?' : `Delete this ${taskType === 'todo' ? 'To Do' : taskType === 'daily' ? 'Daily' : 'Habit'}`}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
