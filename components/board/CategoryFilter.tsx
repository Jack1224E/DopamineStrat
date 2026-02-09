'use client';

import { useState, useRef, useEffect } from 'react';
import { Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORY_INFO } from '@/types/categories';

interface CategoryFilterProps {
    selectedCategories: string[];
    onSelectCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategories, onSelectCategory }: CategoryFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const categories = Object.entries(CATEGORY_INFO).map(([key, info]) => ({
        id: key,
        ...info
    }));

    const toggleCategory = (categoryId: string) => {
        onSelectCategory(categoryId);
    };

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-10 px-3 gap-2 border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
                    selectedCategories.length > 0 && "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                )}
            >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {selectedCategories.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-bold rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                        {selectedCategories.length}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-[var(--shadow-medium)] z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        <div className="px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                            By Category
                        </div>
                        {categories.map((cat) => {
                            const isSelected = selectedCategories.includes(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-2 py-1.5 rounded-[var(--radius-sm)] text-sm transition-colors",
                                        "hover:bg-[var(--surface-2)] text-[var(--text-primary)]",
                                        isSelected && "bg-[var(--surface-2)] font-medium"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{cat.emoji}</span>
                                        <span>{cat.label}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                                </button>
                            );
                        })}

                        {selectedCategories.length > 0 && (
                            <div className="pt-2 mt-1 border-t border-[var(--border-subtle)]">
                                <button
                                    onClick={() => {
                                        // We interact with the parent to clear. 
                                        // The parent wrapper needs to handle "clear all categories" if we pass a special value or if we iterate?
                                        // Actually the prop is `onSelectCategory` (toggle).
                                        // Maybe we shouldn't handle "Clear" here or assume parent handles it.
                                        // I'll leave "Clear" to the "X" button in Toolbar or just manual deselect.
                                        // Or better, add a Clear All button.
                                        // For now, simple list.
                                    }}
                                    className="hidden w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] py-1"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
