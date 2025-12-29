'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { ChatInterface } from '@/components/ai/chat-interface';
import { SmartRecommendationCard } from '@/components/ai/smart-recommendation-card';
import { PredictionChart } from '@/components/charts/prediction-chart';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonToggle } from '@/components/ui/neon-toggle';

export default function AIAssistantPage() {
    const { theme } = useTheme();
    const [shareData, setShareData] = useState(true);
    const [anonymousMode, setAnonymousMode] = useState(false);

    const predictionData = [
        { name: '1 Déc', value: 2450 },
        { name: '5 Déc', value: 2100 },
        { name: '10 Déc', value: 1850 },
        { name: '15 Déc', value: 3500 },
        { name: '20 Déc', value: 3100 },
        { name: '25 Déc', value: 2800 },
        { name: '31 Déc', value: 4500 },
    ];

    return (
        <div className={cn('min-h-screen p-6', theme.bgGradient)}>
            {/* Header */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className={cn(theme.textPrimary, 'text-4xl font-bold mb-2')}>Assistant IA</h1>
                    <p className={cn(theme.textSecondary)}>Votre copilote financier intelligent et sécurisé</p>
                </div>

                {/* Privacy Controls Quick Access */}
                <GlassCard variant="compact" className="flex flex-wrap items-center gap-6 border-cyan-500/20">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Assistant On/Off</span>
                        <NeonToggle checked={shareData} onChange={setShareData} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Anonymisation</span>
                        <NeonToggle checked={anonymousMode} onChange={setAnonymousMode} />
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.566.908v5.694c0 5.106-3.533 9.61-8.15 11.05a1 1 0 01-.5 0c-4.617-1.44-8.15-5.944-8.15-11.05V5.808a1 1 0 01.566-.907zm7.834 1.457l-3 1.5V11a3.5 3.5 0 007 0V7.857l-3-1.5a1 1 0 01-1 0z" clipRule="evenodd" />
                        </svg>
                        Données Chiffrées
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Chat & Recommendations */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <GlassCard className="flex-1">
                        <ChatInterface />
                    </GlassCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SmartRecommendationCard
                            index={0}
                            title="Économie Immédiate"
                            description="Nous avons détecté 2 abonnements Netflix en double sur votre compte. Annulez celui du mois dernier pour économiser immédiatement."
                            amount="€15.99"
                            type="saving"
                            icon="💳"
                        />
                        <SmartRecommendationCard
                            index={1}
                            title="Objectif Vacances"
                            description="Vous êtes en avance sur votre budget &apos;Voyage&apos;. En maintenant ce rythme, vous atteindrez votre but 2 mois plus tôt !"
                            amount="+€250"
                            type="tip"
                            icon="✈️"
                        />
                    </div>
                </div>

                {/* Right Column: Predictive Insights */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <PredictionChart data={predictionData} />

                    <GlassCard>
                        <h3 className={cn(theme.textPrimary, 'text-lg font-bold mb-4')}>Analyse de Sécurité</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-300">Confidentialité</span>
                                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">OPTIMAL</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Vos transactions sont anonymisées avant transmission à l&apos;IA. Aucune donnée nominative (nom, RIB, adresse) n&apos;est jamais transmise.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-300">Contrôle RGPD</span>
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">ACTIF</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Vous disposez du droit permanent de retrait de vos données et de modification de vos préférences de partage.
                                </p>
                            </div>
                        </div>

                        <button className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all">
                            Paramètres Avancés
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
