'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface GradientAvatarProps {
    src?: string;
    initials?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    pulse?: boolean;
    className?: string;
}

export function GradientAvatar({
    src,
    initials,
    size = 'md',
    pulse = false,
    className,
}: GradientAvatarProps) {
    const { theme } = useTheme();

    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
    };

    return (
        <div className={cn('relative', className)}>
            {/* Gradient border with glow */}
            <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 blur-md"
                animate={pulse ? {
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.1, 1],
                } : {}}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Avatar container */}
            <div className={cn(
                'relative',
                'rounded-full',
                'overflow-hidden',
                'border-2',
                'border-transparent',
                'bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500',
                'p-0.5',
                sizes[size]
            )}>
                <div className={cn(
                    'w-full',
                    'h-full',
                    'rounded-full',
                    'overflow-hidden',
                    'bg-gray-900',
                    'flex',
                    'items-center',
                    'justify-center',
                )}>
                    {src ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={src}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <span className={cn(
                            theme.textPrimary,
                            'font-bold',
                            'bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500',
                            'bg-clip-text text-transparent'
                        )}>
                            {initials || '?'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
