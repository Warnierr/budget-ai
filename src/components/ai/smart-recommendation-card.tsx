'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface SmartRecommendationCardProps {
    title: string;
    description: string;
    amount: string;
    icon?: string;
    type?: 'saving' | 'warning' | 'tip';
    index?: number;
}

export function SmartRecommendationCard({
    title,
    description,
    amount,
    icon = '✨',
    type = 'saving',
    index = 0,
}: SmartRecommendationCardProps) {
    const { theme } = useTheme();

    const typeConfig: Record<string, { glow: string; bg: string; border: string }> = {
        saving: {
            glow: theme.neonCyan,
            bg: 'from-cyan-500/10 to-blue-500/10',
            border: 'border-cyan-500/30',
        },
        warning: {
            glow: theme.neonRed,
            bg: 'from-red-500/10 to-pink-500/10',
            border: 'border-red-500/30',
        },
        tip: {
            glow: theme.neonPurple,
            bg: 'from-purple-500/10 to-indigo-500/10',
            border: 'border-purple-500/30',
        },
    };

    const config = typeConfig[type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <GlassCard className="relative overflow-hidden mb-4 border-l-4" style={{ borderLeftColor: config.glow }}>
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', config.bg)} />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{icon}</span>
                        <div
                            className="px-3 py-1 rounded-full text-sm font-bold bg-white/10"
                            style={{ color: config.glow, boxShadow: `0 0 10px ${config.glow}40` }}
                        >
                            {amount}
                        </div>
                    </div>

                    <h4 className={cn(theme.textPrimary, 'font-bold text-lg mb-1')}>
                        {title}
                    </h4>
                    <p className={cn(theme.textSecondary, 'text-sm leading-relaxed')}>
                        {description}
                    </p>
                </div>

                {/* Subtle glow */}
                <div
                    className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{ background: config.glow }}
                />
            </GlassCard>
        </motion.div>
    );
}
