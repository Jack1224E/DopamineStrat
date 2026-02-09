
import { Suspense } from 'react';
import { TodayBoard } from '@/components/board/TodayBoard';

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center text-[var(--text-muted)]">
                Loading Board...
            </div>
        }>
            <TodayBoard />
        </Suspense>
    );
}
