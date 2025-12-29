'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface NeonToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function NeonToggle({
    checked,
    onChange,
    label,
    disabled = false,
    className,
}: NeonToggleProps) {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <label
            className={cn(
                'flex items-center gap-3 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative">
                {/* Toggle background */}
                <div
                    className={cn(
                        'w-12 h-6 rounded-full transition-all duration-300',
                        checked
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : 'bg-white/10 border border-white/20'
                    )}
                >
                    {/* Glow effect when active */}
                    {checked && (
                        <div
                            className="absolute inset-0 rounded-full blur-md"
                            style={{
                                background: `radial-gradient(circle, ${theme.neonGreen}40 0%, transparent 70%)`,
                            }}
                        />
                    )}
                </div>

                {/* Toggle knob */}
                <motion.div
                    className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full shadow-lg',
                        checked
                            ? 'bg-white'
                            : 'bg-gray-400'
                    )}
                    animate={{
                        left: checked ? '26px' : '2px',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                    style={{
                        boxShadow: checked
                            ? `0 0 12px ${theme.neonGreen}`
                            : 'none',
                    }}
                />
            </div>

            {/* Label */}
            {label && (
                <span className={cn(theme.textSecondary, 'text-sm font-medium')}>
                    {label}
                </span>
            )}

            {/* Hidden input for accessibility */}
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
                className="sr-only"
            />
        </label>
    );
}
