'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Zap, Coins, Heart, Skull, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Category data with detailed examples
const CATEGORIES = [
    {
        name: 'Productivity',
        emoji: '💼',
        attribute: 'Intelligence',
        attrEmoji: '🧠',
        color: 'from-blue-600 to-blue-800',
        borderColor: 'border-blue-500/50',
        description: 'Work, study, and getting things done. Anything that moves your career, education, or projects forward.',
        examples: [
            'Complete a work report',
            'Study for 1 hour',
            'Reply to all emails',
            'Learn a new skill',
            'Organize workspace',
        ],
    },
    {
        name: 'Sports',
        emoji: '🏃',
        attribute: 'Endurance',
        attrEmoji: '🫀',
        color: 'from-green-600 to-green-800',
        borderColor: 'border-green-500/50',
        description: 'Athletic activities, outdoor games, and competitive physical activities that test your limits.',
        examples: [
            'Play a game of basketball',
            'Go for a run',
            'Join a soccer match',
            'Swim 10 laps',
            'Cycling session',
        ],
    },
    {
        name: 'Fitness',
        emoji: '💪',
        attribute: 'Strength',
        attrEmoji: '⚔️',
        color: 'from-red-600 to-red-800',
        borderColor: 'border-red-500/50',
        description: 'Structured workouts, weightlifting, and physical training to build strength and muscle.',
        examples: [
            'Complete gym workout',
            'Do 50 push-ups',
            'Yoga session',
            'Home HIIT workout',
            'Planks for 5 minutes',
        ],
    },
    {
        name: 'Self-Care',
        emoji: '🧘',
        attribute: 'Vitality',
        attrEmoji: '❤️',
        color: 'from-pink-600 to-pink-800',
        borderColor: 'border-pink-500/50',
        description: 'Health, rest, and personal wellness. Taking care of your body and mind.',
        examples: [
            'Meditate for 10 minutes',
            'Get 8 hours of sleep',
            'Take vitamins',
            'Drink 8 glasses of water',
            'Skincare routine',
        ],
    },
    {
        name: 'Creativity',
        emoji: '🎨',
        attribute: 'Insight',
        attrEmoji: '👁️',
        color: 'from-purple-600 to-purple-800',
        borderColor: 'border-purple-500/50',
        description: 'Art, music, writing, and creative pursuits. Expressing yourself and exploring new ideas.',
        examples: [
            'Draw or paint for 30 mins',
            'Write in journal',
            'Practice an instrument',
            'Work on a side project',
            'Photography session',
        ],
    },
    {
        name: 'Social',
        emoji: '👥',
        attribute: 'Charisma',
        attrEmoji: '✨',
        color: 'from-yellow-600 to-amber-800',
        borderColor: 'border-yellow-500/50',
        description: 'Connecting with friends, family, and community. Building meaningful relationships.',
        examples: [
            'Call a friend',
            'Family dinner',
            'Attend a social event',
            'Help someone in need',
            'Join a club meeting',
        ],
    },
];

// Container animation
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function RulesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-amber-400" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Game Rules
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
                {/* Intro Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-3xl font-bold text-white">
                        Welcome, <span className="text-amber-400">Chosen Undead</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Complete tasks to earn <span className="text-cyan-400 font-medium">Souls</span> and{' '}
                        <span className="text-amber-400 font-medium">XP</span>. Each task belongs to a category
                        that levels up a corresponding <span className="text-purple-400 font-medium">Attribute</span>.
                    </p>
                </motion.section>

                {/* Quick Stats */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                        <Coins className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Souls</p>
                        <p className="text-xs text-slate-500">Currency for shop</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                        <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">XP</p>
                        <p className="text-xs text-slate-500">Level up your character</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                        <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Health</p>
                        <p className="text-xs text-slate-500">Lose HP on failures</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                        <Skull className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Hollowing</p>
                        <p className="text-xs text-slate-500">-10% max HP per death</p>
                    </div>
                </motion.section>

                {/* Categories Grid */}
                <section className="space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Info className="w-6 h-6 text-blue-400" />
                        Task Categories
                    </h3>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-6"
                    >
                        {CATEGORIES.map((category, index) => (
                            <motion.div
                                key={category.name}
                                variants={itemVariants}
                                className={cn(
                                    "rounded-2xl border overflow-hidden",
                                    "bg-gradient-to-br from-slate-800/80 to-slate-900",
                                    category.borderColor
                                )}
                            >
                                {/* Category Header */}
                                <div className={cn(
                                    "p-4 bg-gradient-to-r",
                                    category.color
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{category.emoji}</span>
                                            <div>
                                                <h4 className="text-xl font-bold text-white">
                                                    {category.name}
                                                </h4>
                                                <p className="text-sm text-white/80">
                                                    Boosts: {category.attrEmoji} {category.attribute}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Body */}
                                <div className="p-4 space-y-4">
                                    <p className="text-slate-300">
                                        {category.description}
                                    </p>

                                    {/* Examples */}
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                            Example Tasks
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {category.examples.map((example, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-full bg-slate-700/50 text-sm text-slate-300 border border-slate-600"
                                                >
                                                    {example}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center py-8 text-slate-500 text-sm"
                >
                    <p>
                        ⚔️ Complete tasks. Earn Souls. Don&apos;t go hollow. ⚔️
                    </p>
                </motion.footer>
            </main>
        </div>
    );
}
