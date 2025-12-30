'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface NeonButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'success' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit';
}

export function NeonButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className,
    type = 'button',
}: NeonButtonProps) {
    const { theme } = useTheme();

    const variants = {
        primary: {
            bg: 'bg-gradient-to-r from-blue-600 to-purple-600',
            glow: theme.neonBlue,
            hover: 'hover:from-blue-500 hover:to-purple-500',
        },
        success: {
            bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
            glow: theme.neonGreen,
            hover: 'hover:from-green-500 hover:to-emerald-500',
        },
        danger: {
            bg: 'bg-gradient-to-r from-red-600 to-pink-600',
            glow: theme.neonRed,
            hover: 'hover:from-red-500 hover:to-pink-500',
        },
        ghost: {
            bg: 'bg-white/5 border border-white/20',
            glow: theme.neonCyan,
            hover: 'hover:bg-white/10',
        },
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const variantStyle = variants[variant];

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
                // Base styles
                'relative',
                'rounded-lg',
                'font-semibold',
                theme.textPrimary,
                'transition-all duration-300',
                'shadow-lg',

                // Variant styles
                variantStyle.bg,
                variantStyle.hover,

                // Size
                sizes[size],

                // Disabled
                disabled && 'opacity-50 cursor-not-allowed',

                className
            )}
            style={{
                boxShadow: !disabled ? `0 0 20px ${variantStyle.glow}40` : 'none',
            }}
        >
            {/* Glow effect */}
            {!disabled && (
                <div
                    className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle, ${variantStyle.glow}60 0%, transparent 70%)`,
                    }}
                />
            )}

            {/* Content */}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}
