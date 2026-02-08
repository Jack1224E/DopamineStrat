'use client';

import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/store/gameStore';
import { Heart, Star } from 'lucide-react';

export function StatsBar() {
    const { hp, maxHp, xp, xpToLevel, level } = useGameStore();

    const hpPercentage = (hp / maxHp) * 100;
    const xpPercentage = (xp / xpToLevel) * 100;

    return (
        <div className="flex items-center gap-6">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/50 shrink-0">
                <span className="text-2xl">🧙</span>
            </div>

            {/* User info and bars */}
            <div className="flex-1 space-y-2">
                {/* Username and level */}
                <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Adventurer</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-primary" />
                        Level {level}
                    </span>
                </div>

                {/* HP Bar */}
                <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-destructive shrink-0" />
                    <Progress
                        value={hpPercentage}
                        className="h-2.5 flex-1 bg-muted [&>div]:bg-[hsl(var(--hp-bar))]"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">{hp} / {maxHp}</span>
                </div>

                {/* XP Bar */}
                <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-amber-500 shrink-0" />
                    <Progress
                        value={xpPercentage}
                        className="h-2.5 flex-1 bg-muted [&>div]:bg-amber-500"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">{xp} / {xpToLevel}</span>
                </div>
            </div>
        </div>
    );
}
