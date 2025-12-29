'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'green' | 'red' | 'blue' | 'purple' | 'cyan';
    index?: number;
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    color = 'blue',
    index = 0,
}: StatCardProps) {
    const { theme } = useTheme();

    const colorConfig = {
        green: {
            bg: 'from-green-600/20 to-emerald-600/20',
            text: theme.neonGreen,
            glow: theme.neonGreen,
        },
        red: {
            bg: 'from-red-600/20 to-pink-600/20',
            text: theme.neonRed,
            glow: theme.neonRed,
        },
        blue: {
            bg: 'from-blue-600/20 to-cyan-600/20',
            text: theme.neonBlue,
            glow: theme.neonBlue,
        },
        purple: {
            bg: 'from-purple-600/20 to-pink-600/20',
            text: theme.neonPurple,
            glow: theme.neonPurple,
        },
        cyan: {
            bg: 'from-cyan-600/20 to-blue-600/20',
            text: theme.neonCyan,
            glow: theme.neonCyan,
        },
    };

    const config = colorConfig[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <GlassCard hover className="relative overflow-hidden">
                {/* Gradient background */}
                <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-30',
                    config.bg
                )} />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className={cn(theme.textSecondary, 'text-sm font-medium uppercase tracking-wide')}>
                            {title}
                        </span>
                        {icon && (
                            <div
                                className="p-2 rounded-lg bg-white/5"
                                style={{
                                    boxShadow: `0 0 20px ${config.glow}40`,
                                }}
                            >
                                {icon}
                            </div>
                        )}
                    </div>

                    {/* Value */}
                    <div className="mb-2">
                        <div
                            className="text-4xl font-bold"
                            style={{ color: config.text }}
                        >
                            {value}
                        </div>
                    </div>

                    {/* Trend */}
                    {trend && (
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                'px-2 py-1 rounded text-xs font-semibold',
                                trend.isPositive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </div>
                            <span className={cn(theme.textTertiary, 'text-xs')}>
                                vs mois dernier
                            </span>
                        </div>
                    )}
                </div>

                {/* Glow effect */}
                <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
                    }}
                />
            </GlassCard>
        </motion.div>
    );
}
