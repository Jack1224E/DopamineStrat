'use client';

import Link from 'next/link';
import { Sun, Moon, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { useTheme } from '@/lib/theme-context';

export function Header() {
    const { theme, toggleTheme } = useTheme();
    const { soundEnabled, toggleSound } = useGameStore();

    return (
        <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DopamineStrategy
            </h1>

            <div className="flex items-center gap-2">
                <Link href="/docs">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Game Docs & Roadmap"
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                        <BookOpen className="w-5 h-5" />
                    </Button>
                </Link>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSound}
                    title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                    {soundEnabled ? (
                        <Volume2 className="w-5 h-5" />
                    ) : (
                        <VolumeX className="w-5 h-5" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'cyberpunk' : 'light'} theme`}
                >
                    {theme === 'light' ? (
                        <Moon className="w-5 h-5" />
                    ) : (
                        <Sun className="w-5 h-5" />
                    )}
                </Button>
            </div>
        </header>
    );
}

