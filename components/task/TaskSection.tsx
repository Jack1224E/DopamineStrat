'use client';

import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

interface TaskSectionProps {
    title: string;
    tasks: Task[];
    icon?: React.ReactNode;
}

export function TaskSection({ title, tasks, icon }: TaskSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                    {tasks.length}
                </span>
            </div>

            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="p-6 text-center rounded-lg border border-dashed border-border text-muted-foreground">
                        No tasks yet
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))
                )}
            </div>
        </section>
    );
}
