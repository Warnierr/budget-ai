'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  PiggyBank,
  Home,
  CreditCard,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  category: string;
  title: string;
  message: string;
  recommendation?: string;
  value?: number;
  target?: number;
}

interface BudgetAnalysis {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  breakdown: {
    needs: number;
    wants: number;
    savings: number;
    subscriptions: number;
    housing: number;
  };
  ratios: {
    needs: number;
    wants: number;
    savings: number;
    subscriptions: number;
    housing: number;
  };
  healthScore: number;
  insights: Insight[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'À améliorer';
  return 'Critique';
}

function InsightIcon({ type }: { type: string }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'danger':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

export function WidgetBudgetAdvisor() {
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch('/api/budget/analysis');
        if (response.ok) {
          const data = await response.json();
          setAnalysis(data.analysis);
        } else {
          setError('Impossible de charger l\'analyse');
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Conseils Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Conseils Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            {error || 'Importez des transactions pour obtenir des conseils personnalisés.'}
          </p>
          <Link href="/dashboard/import" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
            Importer des transactions →
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Prendre les 3 insights les plus importants (danger > warning > info > success)
  const priorityOrder = { danger: 0, warning: 1, info: 2, success: 3 };
  const topInsights = [...analysis.insights]
    .sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Conseils Budget
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(analysis.healthScore)}`}>
              {analysis.healthScore}
            </span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>
        <CardDescription>
          Santé financière : <span className={getScoreColor(analysis.healthScore)}>{getScoreLabel(analysis.healthScore)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de score */}
        <div className="space-y-1">
          <Progress value={analysis.healthScore} className="h-2" />
        </div>

        {/* Règle 50/30/20 */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="font-medium text-blue-600">{analysis.ratios.needs.toFixed(0)}%</div>
            <div className="text-gray-500">Besoins</div>
            <div className="text-[10px] text-gray-400">obj: 50%</div>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <div className="font-medium text-purple-600">{analysis.ratios.wants.toFixed(0)}%</div>
            <div className="text-gray-500">Envies</div>
            <div className="text-[10px] text-gray-400">obj: 30%</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className={`font-medium ${analysis.ratios.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analysis.ratios.savings.toFixed(0)}%
            </div>
            <div className="text-gray-500">Épargne</div>
            <div className="text-[10px] text-gray-400">obj: 20%</div>
          </div>
        </div>

        {/* Top insights */}
        <div className="space-y-2">
          {topInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-2 rounded-lg text-sm ${insight.type === 'danger'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : insight.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : insight.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
            >
              <div className="flex items-start gap-2">
                <InsightIcon type={insight.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {insight.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {insight.message}
                  </p>
                  {insight.recommendation && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé rapide */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Revenus: {formatCurrency(analysis.monthlyIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span>Dépenses: {formatCurrency(analysis.monthlyExpenses)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-500" />
            <span>Loyer: {analysis.ratios.housing.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-500" />
            <span>Abos: {formatCurrency(analysis.breakdown.subscriptions)}</span>
          </div>
        </div>

        {/* Lien vers AI */}
        <Link
          href="/dashboard/ai-assistant"
          className="flex items-center justify-center gap-1 text-sm text-purple-600 hover:text-purple-700 pt-2"
        >
          Demander des conseils à l&apos;IA
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
