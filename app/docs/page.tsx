'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, BookOpen, Heart, Zap, Coins, Skull, Shield,
    FlaskConical, Swords, Brain, Sparkles, ChevronRight,
    Bot, Target, TrendingUp, Flame, Eye, Dumbbell, Users,
    Palette, Trophy, AlertTriangle, CheckCircle2, Clock, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ─── Animation Variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const cardPop = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ─── Section Wrapper ─── */
function Section({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } } }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color, border }: {
    icon: React.ElementType; label: string; value: string; color: string; border: string;
}) {
    return (
        <motion.div variants={cardPop} className={cn(
            "relative group rounded-2xl p-5 border overflow-hidden",
            "bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm",
            "hover:scale-[1.03] transition-transform duration-300",
            border
        )}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", `bg-gradient-to-br ${color}`)} style={{ opacity: 0.06 }} />
            <Icon className={cn("w-7 h-7 mb-2", color.includes('red') ? 'text-red-400' : color.includes('cyan') ? 'text-cyan-400' : color.includes('amber') ? 'text-amber-400' : color.includes('green') ? 'text-green-400' : 'text-slate-400')} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        </motion.div>
    );
}

/* ─── Mechanic Card ─── */
function MechanicCard({ icon: Icon, title, description, details, iconColor, gradient }: {
    icon: React.ElementType; title: string; description: string; details: string[]; iconColor: string; gradient: string;
}) {
    return (
        <motion.div variants={cardPop} className="rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm overflow-hidden group hover:border-slate-600/80 transition-all duration-300">
            <div className={cn("p-5 border-b border-slate-700/40", gradient)}>
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl bg-black/20 ring-1 ring-white/10")}>
                        <Icon className={cn("w-5 h-5", iconColor)} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
            </div>
            <div className="p-5 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
                <ul className="space-y-2">
                    {details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                            <span>{d}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

/* ─── Category Row ─── */
const CATEGORIES = [
    { name: 'Productivity', emoji: '💼', attr: 'Intelligence', attrEmoji: '🧠', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Sports', emoji: '🏃', attr: 'Endurance', attrEmoji: '🫀', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { name: 'Fitness', emoji: '💪', attr: 'Strength', attrEmoji: '⚔️', icon: Dumbbell, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { name: 'Self-Care', emoji: '🧘', attr: 'Vitality', attrEmoji: '❤️', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { name: 'Creativity', emoji: '🎨', attr: 'Insight', attrEmoji: '👁️', icon: Palette, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Social', emoji: '👥', attr: 'Charisma', attrEmoji: '✨', icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
];

/* ─── Roadmap Item ─── */
function RoadmapItem({ icon: Icon, title, description, status, iconColor }: {
    icon: React.ElementType; title: string; description: string; status: 'live' | 'next' | 'planned'; iconColor: string;
}) {
    const statusConfig = {
        live: { label: 'Live', bg: 'bg-green-500/15', text: 'text-green-400', ring: 'ring-green-500/30', dot: 'bg-green-400' },
        next: { label: 'Up Next', bg: 'bg-amber-500/15', text: 'text-amber-400', ring: 'ring-amber-500/30', dot: 'bg-amber-400' },
        planned: { label: 'Planned', bg: 'bg-slate-500/15', text: 'text-slate-400', ring: 'ring-slate-500/30', dot: 'bg-slate-500' },
    };
    const s = statusConfig[status];

    return (
        <motion.div variants={cardPop} className="flex gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors duration-200">
            <div className={cn("shrink-0 p-2.5 rounded-xl h-fit", `bg-slate-700/50`)}>
                <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                    <h4 className="font-semibold text-white text-sm">{title}</h4>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1", s.bg, s.text, s.ring)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                        {s.label}
                    </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════ */
/*                      DOCS PAGE                         */
/* ═══════════════════════════════════════════════════════ */

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">

            {/* ─── Sticky Header ─── */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/today">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800">
                                <ArrowLeft className="w-5 h-5 text-slate-300" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-green-500/10 ring-1 ring-green-500/20">
                                <BookOpen className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Docs & Roadmap</h1>
                                <p className="text-xs text-slate-500">How the game works — and where it&apos;s going</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/rules">
                        <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1.5 text-xs">
                            <Swords className="w-3.5 h-3.5" />
                            Full Rules
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">

                {/* ─── Hero ─── */}
                <Section>
                    <div className="text-center space-y-5 max-w-2xl mx-auto">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 ring-1 ring-green-500/20 text-green-400 text-xs font-medium">
                            <Flame className="w-3.5 h-3.5" />
                            Souls-Like Productivity
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Your life is the <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">dungeon</span>.
                            <br />
                            Every task is a <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">boss fight</span>.
                        </h2>
                        <p className="text-slate-400 text-base leading-relaxed">
                            DopamineStrategy treats your real-world tasks like a Soulsborne game. Complete tasks to earn <span className="text-cyan-400 font-medium">Souls</span> and <span className="text-amber-400 font-medium">XP</span>, level up your character, unlock healing flasks, and discover what you&apos;re genuinely capable of. Skip your tasks? You take damage. Go hollow enough times and you&apos;re done — just like Dark Souls.
                        </p>
                    </div>
                </Section>

                {/* ─── Core Stats Grid ─── */}
                <Section delay={0.1}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Core Stats</h3>
                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={Heart} label="Your attempt budget" value="Health (HP)" color="from-red-500/20 to-red-900/10" border="border-red-500/20" />
                        <StatCard icon={Zap} label="Earned by surviving" value="Experience (XP)" color="from-amber-500/20 to-amber-900/10" border="border-amber-500/20" />
                        <StatCard icon={Coins} label="Spend at the shop" value="Souls" color="from-cyan-500/20 to-cyan-900/10" border="border-cyan-500/20" />
                        <StatCard icon={Skull} label="Death has consequences" value="Hollowing" color="from-slate-500/20 to-slate-900/10" border="border-slate-500/20" />
                    </motion.div>
                </Section>

                {/* ─── Game Mechanics ─── */}
                <Section delay={0.1}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Game Mechanics</h3>
                    <p className="text-sm text-slate-400 mb-6">Here&apos;s how the pieces fit together. If you&apos;ve played Dark Souls, this will feel familiar.</p>

                    <div className="grid md:grid-cols-2 gap-5">
                        <MechanicCard
                            icon={Heart}
                            title="Health & Damage"
                            iconColor="text-red-400"
                            gradient="bg-gradient-to-r from-red-900/30 to-slate-900/0"
                            description="HP is your lifeline. Miss a Daily or fail a task and you take damage. Hit zero and you're Downed — just like dying in Souls."
                            details={[
                                "Missing Dailies costs HP based on task priority",
                                "HP regenerates slowly through Self-Care tasks",
                                "Flasks give instant HP recovery (earned through leveling)",
                                "At 0 HP: you're Downed. Complete a recovery task to stand back up."
                            ]}
                        />
                        <MechanicCard
                            icon={Skull}
                            title="Hollowing"
                            iconColor="text-slate-400"
                            gradient="bg-gradient-to-r from-slate-700/30 to-slate-900/0"
                            description="Every time you die (HP hits 0), your Hollow Level increases. This permanently reduces your max HP — just like going hollow in Dark Souls."
                            details={[
                                "Each death: +1 Hollow Level → -10% max HP",
                                "Max 5 Hollow stacks (50% max HP reduction)",
                                "Reversed by consistent task completion streaks",
                                "Visual indicator on your character avatar"
                            ]}
                        />
                        <MechanicCard
                            icon={Zap}
                            title="XP & Leveling"
                            iconColor="text-amber-400"
                            gradient="bg-gradient-to-r from-amber-900/30 to-slate-900/0"
                            description="Complete tasks to earn XP. Level up to unlock better recovery tools and higher multipliers. Higher levels also bring higher expectations."
                            details={[
                                "XP scales with task difficulty and category",
                                "Leveling up increases max HP and Flask count",
                                "Higher levels unlock Checkpoint mechanics for big tasks",
                                "No consolation XP for failures — strict but fair"
                            ]}
                        />
                        <MechanicCard
                            icon={FlaskConical}
                            title="Healing Flasks"
                            iconColor="text-green-400"
                            gradient="bg-gradient-to-r from-green-900/30 to-slate-900/0"
                            description="Your emergency recovery. Flasks restore HP instantly, but you have a limited supply. Earn more by leveling up, just like upgrading Estus."
                            details={[
                                "Level 1: 1 Flask per day (+25 HP each)",
                                "Level 5: 2 Flasks per day",
                                "Level 10: 3 Flasks per day",
                                "Can't exceed your current max HP"
                            ]}
                        />
                        <MechanicCard
                            icon={Coins}
                            title="Souls Economy"
                            iconColor="text-cyan-400"
                            gradient="bg-gradient-to-r from-cyan-900/30 to-slate-900/0"
                            description="Souls are the currency you earn upon completing tasks. Spend them in the Flask Shop to buy more healing — or save up for bigger unlocks."
                            details={[
                                "Earned alongside XP from task completion",
                                "Spent at the Flask Shop on recovery items",
                                "Higher difficulty tasks = more Souls",
                                "Future: more shop items and upgrades"
                            ]}
                        />
                        <MechanicCard
                            icon={Shield}
                            title="Task Types"
                            iconColor="text-blue-400"
                            gradient="bg-gradient-to-r from-blue-900/30 to-slate-900/0"
                            description="Three types of tasks, each with their own rhythm. Think of them as different enemy types in the dungeon."
                            details={[
                                "Habits: repeatable micro-inputs (+ / −), quick wins",
                                "Dailies: binary commitments — done or not, HP penalty if skipped",
                                "To-Do's: boss fights with deadlines and phases"
                            ]}
                        />
                    </div>
                </Section>

                {/* ─── Categories ─── */}
                <Section delay={0.1}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Categories & Attributes</h3>
                    <p className="text-sm text-slate-400 mb-6">Every task belongs to a category. Each category levels up a corresponding attribute — your RPG character sheet, built through real effort.</p>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CATEGORIES.map((cat) => (
                            <motion.div key={cat.name} variants={cardPop} className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]",
                                "bg-slate-800/30", cat.border
                            )}>
                                <div className={cn("p-2.5 rounded-xl", cat.bg)}>
                                    <cat.icon className={cn("w-5 h-5", cat.color)} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{cat.emoji}</span>
                                        <span className="font-semibold text-white text-sm">{cat.name}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Levels up {cat.attrEmoji} <span className={cat.color}>{cat.attr}</span>
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </Section>

                {/* ─── The Philosophy ─── */}
                <Section delay={0.1}>
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                                <Swords className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">The Souls Philosophy</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            In Dark Souls, the game doesn&apos;t care if the boss had 10 HP left. A fail is a fail. But that strictness is what makes victory meaningful. We apply the same principle here: <span className="text-green-400 font-medium">no half-credit, no consolation XP</span>. You either did the thing or you didn&apos;t.
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            But Souls is also fair. It gives you information on failure so you can learn. When you miss a task, you see what happened, what you can adjust, and how to come back stronger. <span className="text-amber-400 font-medium">Failure is data, not punishment</span>.
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Your &quot;loot&quot; isn&apos;t shiny gear — it&apos;s <span className="text-cyan-400 font-medium">more attempts</span> (HP), <span className="text-green-400 font-medium">better recovery</span> (Flasks), and <span className="text-amber-400 font-medium">higher stakes</span> (multipliers). The reward for getting stronger is the ability to take on harder challenges. That&apos;s the loop.
                        </p>
                    </div>
                </Section>

                {/* ─── Roadmap ─── */}
                <Section delay={0.1}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Roadmap</h3>
                        <span className="text-[10px] text-slate-600 uppercase tracking-wider">What&apos;s coming next</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-6">We&apos;re actively building toward a deeper Souls experience. Here&apos;s what&apos;s live, what&apos;s next, and what&apos;s on the horizon.</p>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-3">
                        <RoadmapItem
                            icon={CheckCircle2}
                            title="Core Souls Economy"
                            description="HP, XP, Souls, Hollowing, Flask Shop, Death mechanics — the full core loop is live and working."
                            status="live"
                            iconColor="text-green-400"
                        />
                        <RoadmapItem
                            icon={Star}
                            title="Category Attributes & Filters"
                            description="Six task categories that level up RPG attributes. Filter your board by category to focus on specific life domains."
                            status="live"
                            iconColor="text-green-400"
                        />
                        <RoadmapItem
                            icon={Bot}
                            title="AI Judge & Coach"
                            description="An AI that evaluates task legitimacy, catches XP-milking, designs personalized boss challenges, and provides post-failure coaching — like Souls tutorial messages, but actually helpful."
                            status="next"
                            iconColor="text-amber-400"
                        />
                        <RoadmapItem
                            icon={Target}
                            title="Tiered Boss Challenges"
                            description="AI-designed multi-tier challenges with escalating difficulty. Think push-up trials with progressive time limits, staked HP, and scaling XP rewards."
                            status="next"
                            iconColor="text-amber-400"
                        />
                        <RoadmapItem
                            icon={Flame}
                            title="Bonfire Checkpoints"
                            description="For big deadline tasks, set milestones so you don't lose all progress on a late failure. Earned through leveling — because in Souls, you earn the right to reduce frustration."
                            status="planned"
                            iconColor="text-orange-400"
                        />
                        <RoadmapItem
                            icon={Eye}
                            title="Failure Analytics"
                            description="Detailed post-failure insights: what went wrong, patterns over time, and actionable suggestions. Information as reward, not consolation."
                            status="planned"
                            iconColor="text-purple-400"
                        />
                        <RoadmapItem
                            icon={TrendingUp}
                            title="Dynamic Difficulty Scaling"
                            description="Higher levels bring higher stakes. Baby tasks yield diminishing returns at high levels, pushing you toward genuine growth."
                            status="planned"
                            iconColor="text-blue-400"
                        />
                        <RoadmapItem
                            icon={Trophy}
                            title="Achievement System"
                            description="Unlock titles and badges for streaks, boss completions, and attribute milestones. Bragging rights earned through consistency."
                            status="planned"
                            iconColor="text-yellow-400"
                        />
                    </motion.div>
                </Section>

                {/* ─── Footer ─── */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center py-10 border-t border-slate-800/50"
                >
                    <p className="text-slate-600 text-sm">
                        ⚔️ Complete tasks. Earn Souls. Don&apos;t go hollow. ⚔️
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <Link href="/today">
                            <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 text-xs gap-1.5">
                                ← Back to Board
                            </Button>
                        </Link>
                        <Link href="/rules">
                            <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-xs gap-1.5">
                                <Swords className="w-3.5 h-3.5" />
                                Full Rules
                            </Button>
                        </Link>
                    </div>
                </motion.footer>
            </main>
        </div>
    );
}
