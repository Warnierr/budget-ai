'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonToggle } from '@/components/ui/neon-toggle';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
    subscription: {
        id: string;
        name: string;
        plan?: string;
        amount: number;
        frequency: string;
        billingDate: number;
        isActive: boolean;
        logo?: string;
    };
    onToggle: (id: string, isActive: boolean) => void;
}

export function SubscriptionCard({ subscription, onToggle }: SubscriptionCardProps) {
    const { theme } = useTheme();
    const [isActive, setIsActive] = useState(subscription.isActive);

    const handleToggle = (checked: boolean) => {
        setIsActive(checked);
        onToggle(subscription.id, checked);
    };

    // Calculate next billing date
    const today = new Date();
    const currentDay = today.getDate();
    let daysUntilBilling = subscription.billingDate - currentDay;
    if (daysUntilBilling < 0) {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, subscription.billingDate);
        daysUntilBilling = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    return (
        <GlassCard hover className="relative overflow-hidden">
            {/* Status indicator bar */}
            <div
                className={cn(
                    'absolute top-0 left-0 right-0 h-1',
                    isActive
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : 'bg-gray-600'
                )}
                style={{
                    boxShadow: isActive ? `0 0 10px ${theme.neonGreen}` : 'none',
                }}
            />

            <div className="flex items-start justify-between gap-4">
                {/* Logo and Info */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Logo */}
                    <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center',
                        theme.glassBackground,
                        theme.glassBorder
                    )}>
                        {subscription.logo ? (
                            <Image
                                src={subscription.logo}
                                alt={subscription.name}
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                        ) : (
                            <span className={cn(theme.textPrimary, 'text-xl font-bold')}>
                                {subscription.name.charAt(0)}
                            </span>
                        )}
                    </div>

                    {/* Service Info */}
                    <div className="flex-1">
                        <h3 className={cn(theme.textPrimary, 'font-semibold text-lg mb-1')}>
                            {subscription.name}
                        </h3>
                        {subscription.plan && (
                            <p className={cn(theme.textSecondary, 'text-sm opacity-80')}>
                                {subscription.plan}
                            </p>
                        )}
                    </div>
                </div>

                {/* Toggle */}
                <NeonToggle
                    checked={isActive}
                    onChange={handleToggle}
                />
            </div>

            {/* Price and Billing Info */}
            <div className="mt-4 flex items-center justify-between">
                {/* Price Badge */}
                <div className="relative">
                    <div
                        className={cn(
                            'px-4 py-2 rounded-lg font-bold text-lg',
                            isActive
                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                                : cn(theme.glassBackground, theme.glassBorder)
                        )}
                        style={{
                            color: isActive ? theme.neonCyan : undefined,
                            boxShadow: isActive ? `0 0 15px ${theme.neonCyan}40` : 'none',
                        }}
                    >
                        €{subscription.amount.toFixed(2)}
                        <span className={cn(theme.textTertiary, 'text-xs ml-1')}>
                            /{subscription.frequency === 'monthly' ? 'mois' : 'an'}
                        </span>
                    </div>
                </div>

                {/* Next Billing */}
                <div className="text-right">
                    <p className={cn(theme.textTertiary, 'text-xs mb-1')}>
                        Prochaine facturation
                    </p>
                    <div className={cn(theme.textSecondary, 'text-sm')}>
                        {isActive ? (
                            <>
                                <span className="font-semibold">{subscription.billingDate}</span> {new Date().toLocaleString('fr-FR', { month: 'short' })}
                                <span className={cn(theme.textTertiary, 'text-xs ml-2')}>
                                    (dans {daysUntilBilling}j)
                                </span>
                            </>
                        ) : (
                            <span className={theme.textTertiary}>Inactif</span>
                        )}
                    </div>
                </div>
            </div>

            {/* More Details Button */}
            <button
                className={cn(
                    'mt-4 w-full py-2 rounded-lg',
                    theme.glassBackground,
                    theme.glassBorder,
                    'hover:bg-white/10 hover:border-white/20',
                    'transition-all duration-300',
                    theme.textPrimary,
                    'text-sm font-medium'
                )}
            >
                Plus de détails →
            </button>

            {/* Glow effect */}
            {isActive && (
                <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${theme.neonCyan} 0%, transparent 70%)`,
                    }}
                />
            )}
        </GlassCard>
    );
}
