'use client';

import { useState } from 'react';
import { SubscriptionCard } from '@/components/dashboard/subscription-card';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface Subscription {
    id: string;
    name: string;
    plan?: string;
    amount: number;
    frequency: string;
    billingDate: number;
    isActive: boolean;
    logo?: string;
}

interface SubscriptionsClientProps {
    subscriptions: Subscription[];
}

export function SubscriptionsClient({ subscriptions: initialSubscriptions }: SubscriptionsClientProps) {
    const { theme } = useTheme();
    const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate total monthly cost
    const activeSubs = subscriptions.filter(s => s.isActive);
    const totalMonthlyCost = activeSubs.reduce((sum, sub) => {
        return sum + (sub.frequency === 'monthly' ? sub.amount : sub.amount / 12);
    }, 0);

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'active' && sub.isActive) ||
            (filter === 'inactive' && !sub.isActive);

        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleToggleSubscription = (id: string, isActive: boolean) => {
        setSubscriptions(prev =>
            prev.map(sub => (sub.id === id ? { ...sub, isActive } : sub))
        );
    };

    return (
        <div className={cn(
            'min-h-screen',
            'bg-gradient-to-br',
            theme.bgGradient,
            'p-6'
        )}>
            {/* Header with Total Cost Circle */}
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className={cn(theme.textPrimary, 'text-4xl font-bold mb-2')}>
                        Abonnements
                    </h1>
                    <p className={cn(theme.textSecondary)}>
                        Gérez vos paiements récurrents
                    </p>
                </div>

                {/* Total Monthly Cost Circle */}
                <GlassCard className="relative" variant="elevated">
                    <div className="text-center p-4">
                        <p className={cn(theme.textSecondary, 'text-sm uppercase tracking-wide mb-2')}>
                            Coût Mensuel Total
                        </p>
                        <div
                            className="text-5xl font-bold mb-1"
                            style={{ color: theme.neonCyan }}
                        >
                            €{totalMonthlyCost.toFixed(2)}
                        </div>
                        <p className={cn(theme.textTertiary, 'text-xs')}>
                            Prochaine facturation dans 5 jours
                        </p>
                    </div>

                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 rounded-2xl blur-2xl opacity-30 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle, ${theme.neonCyan} 0%, transparent 70%)`,
                        }}
                    />
                </GlassCard>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive'] as const).map(filterType => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={cn(
                                'px-4 py-2 rounded-lg font-medium transition-all duration-300',
                                filter === filterType
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : cn(theme.glassBackground, 'hover:bg-white/10', theme.glassBorder),
                                theme.textPrimary
                            )}
                            style={{
                                boxShadow: filter === filterType ? `0 0 20px ${theme.neonBlue}40` : 'none',
                            }}
                        >
                            {filterType === 'all' && 'Tous'}
                            {filterType === 'active' && 'Actifs'}
                            {filterType === 'inactive' && 'Inactifs'}
                            <span className={cn(theme.textTertiary, 'ml-2 text-sm')}>
                                ({filterType === 'all' ? subscriptions.length :
                                    filterType === 'active' ? activeSubs.length :
                                        subscriptions.length - activeSubs.length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                    <div className={cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg',
                        theme.glassBackground,
                        theme.glassBackdrop,
                        theme.glassBorder
                    )}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher un abonnement..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                'flex-1 bg-transparent outline-none',
                                theme.textPrimary,
                                'placeholder:text-gray-500'
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubscriptions.map(subscription => (
                    <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onToggle={handleToggleSubscription}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredSubscriptions.length === 0 && (
                <GlassCard className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className={cn(theme.textPrimary, 'text-xl font-semibold mb-2')}>
                        Aucun abonnement trouvé
                    </h3>
                    <p className={cn(theme.textSecondary)}>
                        {searchQuery
                            ? `Aucun résultat pour "${searchQuery}"`
                            : 'Ajoutez votre premier abonnement pour commencer'
                        }
                    </p>
                </GlassCard>
            )}
        </div>
    );
}
