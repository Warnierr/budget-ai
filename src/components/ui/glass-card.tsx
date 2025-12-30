'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'compact' | 'elevated';
    hover?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export function GlassCard({
    children,
    className,
    variant = 'default',
    hover = false,
    onClick,
    style,
}: GlassCardProps) {
    const { theme } = useTheme();

    const variants = {
        default: 'p-6',
        compact: 'p-4',
        elevated: 'p-6 shadow-2xl',
    };

    return (
        <div
            className={cn(
                // Base glass effect
                theme.glassBackground,
                theme.glassBackdrop,
                theme.glassBorder,
                'rounded-2xl',

                // Shadows and effects
                'shadow-lg',
                'relative',
                'overflow-hidden',

                // Hover effects
                hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-white/20 cursor-pointer',

                // Variants
                variants[variant],

                className
            )}
            onClick={onClick}
            style={style}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
