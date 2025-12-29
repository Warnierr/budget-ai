'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GlassCard } from '@/components/ui/glass-card';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface PredictionChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
}

export function PredictionChart({ data, title = "Prévision du Solde" }: PredictionChartProps) {
    const { theme } = useTheme();

    return (
        <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className={cn(theme.textPrimary, 'text-xl font-bold')}>{title}</h3>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    IA Predictive
                </span>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.neonCyan} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme.neonCyan} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke={theme.textTertiary}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            hide={true}
                            domain={['dataMin - 500', 'dataMax + 500']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                color: '#fff'
                            }}
                            itemStyle={{ color: theme.neonCyan }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={theme.neonCyan}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorPrediction)"
                            filter="drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center bg-white/5 rounded-xl p-3">
                <div className="text-xs text-gray-400 uppercase tracking-widest">Fin du mois prévue</div>
                <div className="text-xl font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    €{data[data.length - 1]?.value.toLocaleString()}
                </div>
            </div>
        </GlassCard>
    );
}
