'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';

interface DashboardClientProps {
    data: {
        balance: number;
        totalIncome: number;
        totalExpenseReal: number;
        projectedBalance: number;
        pieData: Array<{ name: string; value: number; color: string }>;
        recentActivity: Array<any>;
        allTransactions: Array<any>;
    };
}

export function DashboardClientNeon({ data }: DashboardClientProps) {
    const { theme } = useTheme();

    // Prepare chart data with gradients
    const monthlyData = [
        { month: 'Jan', income: 3200, expenses: 2800 },
        { month: 'Fév', income: 3400, expenses: 3000 },
        { month: 'Mar', income: 3100, expenses: 2900 },
        { month: 'Avr', income: 3500, expenses: 3200 },
        { month: 'Mai', income: 3300, expenses: 2950 },
        { month: 'Juin', income: data.totalIncome, expenses: data.totalExpenseReal },
    ];

    return (
        <div className={cn(
            'min-h-screen',
            'bg-gradient-to-br',
            theme.bgGradient,
            'p-6'
        )}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className={cn(theme.textPrimary, 'text-4xl font-bold mb-2')}>
                    Dashboard
                </h1>
                <p className={cn(theme.textSecondary)}>
                    Vue d&apos;ensemble de vos finances
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Revenus"
                    value={`€${data.totalIncome.toFixed(0)}`}
                    color="green"
                    icon={
                        <svg className="w-6 h-6" style={{ color: theme.neonGreen }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                    }
                    trend={{ value: 12, isPositive: true }}
                    index={0}
                />

                <StatCard
                    title="Total Dépenses"
                    value={`€${data.totalExpenseReal.toFixed(0)}`}
                    color="red"
                    icon={
                        <svg className="w-6 h-6" style={{ color: theme.neonRed }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                    }
                    trend={{ value: 5, isPositive: false }}
                    index={1}
                />

                <StatCard
                    title="Économies"
                    value={`€${data.balance.toFixed(0)}`}
                    color="cyan"
                    icon={
                        <svg className="w-6 h-6" style={{ color: theme.neonCyan }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                    }
                    trend={{ value: 18, isPositive: true }}
                    index={2}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Income vs Expenses Chart */}
                <GlassCard className="lg:col-span-2">
                    <h3 className={cn(theme.textPrimary, 'text-xl font-bold mb-4')}>
                        Revenus vs Dépenses
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.chartBlue} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={theme.chartBlue} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.chartPurple} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={theme.chartPurple} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="month" stroke={theme.textSecondary} />
                            <YAxis stroke={theme.textSecondary} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(10px)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke={theme.chartBlue}
                                fill="url(#colorIncome)"
                                strokeWidth={3}
                                filter="drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))"
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke={theme.chartPurple}
                                fill="url(#colorExpenses)"
                                strokeWidth={3}
                                filter="drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Pie Chart */}
                <GlassCard>
                    <h3 className={cn(theme.textPrimary, 'text-xl font-bold mb-4')}>
                        Cat égories
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => entry.name}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard>
                <h3 className={cn(theme.textPrimary, 'text-xl font-bold mb-4')}>
                    Activité Récente
                </h3>
                <div className="space-y-3">
                    {data.recentActivity.slice(0, 5).map((activity, index) => (
                        <div
                            key={activity.id}
                            className={cn(
                                'flex items-center justify-between p-3 rounded-lg',
                                'bg-white/5 hover:bg-white/10 transition-colors'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    activity.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                                )}
                                    style={{
                                        boxShadow: `0 0 10px ${activity.type === 'income' ? theme.neonGreen : theme.neonRed}`,
                                    }}
                                />
                                <span className={theme.textPrimary}>{activity.name}</span>
                            </div>
                            <span className={cn(
                                'font-semibold',
                                activity.type === 'income' ? 'text-green-400' : 'text-red-400'
                            )}>
                                {activity.type === 'income' ? '+' : '-'}€{activity.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
