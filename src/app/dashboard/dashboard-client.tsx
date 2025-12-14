"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getSubscriptionChargeForDate, shouldTriggerRecurringIncome } from "@/lib/projections";
import { SpendingPieChart } from "@/components/charts/spending-pie";
import { BalanceEvolution } from "@/components/charts/balance-evolution";
import { BalanceHeatmap } from "@/components/charts/balance-heatmap";
import { WidgetGoals } from "@/components/dashboard/widget-goals";
import { WidgetSubscriptions } from "@/components/dashboard/widget-subscriptions";
import { WidgetAccounts } from "@/components/dashboard/widget-accounts";
import { WidgetActivity } from "@/components/dashboard/widget-activity";
import { WidgetSettings, WidgetPreferences } from "@/components/dashboard/widget-settings";
import { AccountSelector, AccountTypeInfo } from "@/components/dashboard/account-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertCircle,
  Sparkles,
  PiggyBank,
  TrendingUp as TrendingUpIcon,
  Coins
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = 'budget-ai-dashboard-widgets';
const ACCOUNT_STORAGE_KEY = 'budget-ai-selected-account';

interface DashboardClientProps {
  data: {
    balance: number;
    totalIncome: number;
    totalExpenseReal: number;
    projectedBalance: number;
    pendingSubscriptionCost: number;
    totalSubscriptionCost: number;
    pieData: Array<{ name: string; value: number; color: string }>;
    recentActivity: Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      type: 'income' | 'expense';
    }>;
    // Pour le nouveau graphique avancé
    allTransactions: Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      type: 'income' | 'expense';
      bankAccountId?: string | null;
    }>;
    recurringIncomes: Array<{
      id: string;
      name: string;
      amount: number;
      frequency: string;
      isRecurring: boolean;
      startDate: string;
    }>;
    goals: Array<{
      id: string;
      name: string;
      targetAmount: number;
      currentAmount: number;
      deadline: string | null;
      isCompleted: boolean;
    }>;
    subscriptions: Array<{
      id: string;
      name: string;
      amount: number;
      frequency: string;
      billingDate: number;
      isActive: boolean;
      bankAccountId?: string | null;
    }>;
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      bank: string | null;
      currentBalance: number;
      color: string | null;
      isDefault: boolean;
    }>;
  };
  initialPreferences: WidgetPreferences;
}

type DashboardPreferences = WidgetPreferences & { heatmap?: boolean };

export function DashboardClient({ data, initialPreferences }: DashboardClientProps) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(initialPreferences);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger les préférences depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...initialPreferences, ...parsed });
      }
      // Charger le compte sélectionné
      const savedAccount = localStorage.getItem(ACCOUNT_STORAGE_KEY);
      if (savedAccount) {
        setSelectedAccountId(savedAccount === 'null' ? null : savedAccount);
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }, [initialPreferences]);

  // Sauvegarder le compte sélectionné
  const handleSelectAccount = (accountId: string | null) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(ACCOUNT_STORAGE_KEY, accountId || 'null');
  };

  // Obtenir le compte sélectionné
  const selectedAccount = selectedAccountId 
    ? data.accounts.find(a => a.id === selectedAccountId) 
    : null;

  // Filtrer les données selon le compte sélectionné
  const filteredData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const isWithinCurrentMonth = (dateStr: string) => {
      const date = new Date(dateStr);
      return date >= monthStart && date <= monthEnd;
    };

    const isPastOrToday = (dateStr: string) => {
      const date = new Date(dateStr);
      return date <= now;
    };

    const aggregatedBalance = data.accounts.reduce((sum, account) => sum + account.currentBalance, 0);

    if (!selectedAccountId) {
      // Tous les comptes - données originales
      return {
        transactions: data.allTransactions,
        subscriptions: data.subscriptions,
        balance: aggregatedBalance,
        totalIncome: data.totalIncome,
        totalExpenseReal: data.totalExpenseReal,
      };
    }

    // Filtrer par compte
    const accountTransactions = data.allTransactions.filter(
      t => t.bankAccountId === selectedAccountId
    );
    const accountSubscriptions = data.subscriptions.filter(
      s => s.bankAccountId === selectedAccountId
    );

    // Recalculer les totaux pour ce compte
    const currentMonthTransactions = accountTransactions.filter(
      t => isWithinCurrentMonth(t.date) && isPastOrToday(t.date)
    );

    const accountIncomes = currentMonthTransactions.filter(t => t.type === 'income');
    const accountExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
    
    const totalIncome = accountIncomes.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = accountExpenses.reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions: accountTransactions,
      subscriptions: accountSubscriptions,
      balance: selectedAccount?.currentBalance || 0,
      totalIncome,
      totalExpenseReal: totalExpense,
    };
  }, [selectedAccountId, data, selectedAccount]);

  const handleSavePreferences = async (newPrefs: WidgetPreferences) => {
    try {
      // Sauvegarder en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
      toast({
        title: "Préférences sauvegardées",
        description: "Votre dashboard a été personnalisé.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive",
      });
    }
  };

  const {
    balance,
    totalIncome,
    totalExpenseReal,
    projectedBalance,
    pendingSubscriptionCost,
    totalSubscriptionCost,
    pieData,
    recentActivity,
    allTransactions,
    recurringIncomes,
    goals,
    subscriptions,
    accounts,
  } = data;

  const normalizedRecurringIncomes: Array<{
    id: string;
    name: string;
    amount: number;
    frequency: string;
    isRecurring: boolean;
    startDate: string;
  }> = (recurringIncomes || []).map((income) => ({
    ...income,
    startDate: income.startDate || new Date().toISOString(),
  }));

  const pieChartData: Array<{ name: string; value: number; color: string }> = pieData.map(
    (item) => ({ ...item, color: item.color || "#94a3b8" })
  );

  // Obtenir les conseils adaptés au type de compte
  const getAccountAdvice = () => {
    if (!selectedAccount) {
      return {
        positive: "🎉 Votre patrimoine global est positif ! Continuez à diversifier vos placements.",
        negative: "⚠️ Attention à votre solde global. Vérifiez vos comptes courants."
      };
    }

    const advices: Record<string, { positive: string; negative: string }> = {
      checking: {
        positive: "🎉 Votre compte courant est sain ! Pensez à transférer l'excédent vers l'épargne.",
        negative: "⚠️ Votre compte courant est dans le rouge. Réduisez les dépenses non essentielles."
      },
      savings: {
        positive: "💰 Excellent ! Votre épargne grandit. Continuez à alimenter ce compte régulièrement.",
        negative: "📉 Votre épargne diminue. Évitez les retraits sauf urgence."
      },
      investment: {
        positive: "📈 Vos investissements performent bien ! Restez patient sur le long terme.",
        negative: "📉 Vos investissements sont en baisse. C'est normal, ne vendez pas dans la panique."
      },
      crypto: {
        positive: "🚀 Vos cryptos sont en hausse ! N'oubliez pas de sécuriser une partie des gains.",
        negative: "📉 Marché baissier. HODL et n'investissez que ce que vous pouvez perdre."
      }
    };

    return advices[selectedAccount.type] || advices.checking;
  };

  const accountAdvice = getAccountAdvice();

  const heatmapRange = useMemo(() => {
    const hasTransactions = filteredData.transactions && filteredData.transactions.length > 0;
    const hasProjectionSources =
      (normalizedRecurringIncomes?.length ?? 0) > 0 ||
      ((filteredData.subscriptions?.length ?? 0) > 0);

    if (!hasTransactions && !hasProjectionSources) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    const start = new Date(end);
    start.setMonth(start.getMonth() - 3);
    start.setDate(1);

    const projectionEnd = new Date(end);
    projectionEnd.setMonth(projectionEnd.getMonth() + 3); // ≈3 mois

    type DayStat = { incomes: number; expenses: number; net: number };
    const historicalMap = new Map<string, DayStat>();
    const futureMap = new Map<string, { incomes: number; expenses: number }>();

    filteredData.transactions?.forEach((transaction) => {
      const txDate = new Date(transaction.date);
      txDate.setHours(0, 0, 0, 0);
      if (txDate < start || txDate > projectionEnd) {
        return;
      }
      const key = txDate.toISOString().split("T")[0];
      const isFuture = txDate > end;

      if (isFuture) {
        const entry = futureMap.get(key) || { incomes: 0, expenses: 0 };
        if (transaction.type === "income") {
          entry.incomes += transaction.amount;
        } else {
          entry.expenses += transaction.amount;
        }
        futureMap.set(key, entry);
      } else {
        const entry = historicalMap.get(key) || { incomes: 0, expenses: 0, net: 0 };
        if (transaction.type === "income") {
          entry.incomes += transaction.amount;
          entry.net += transaction.amount;
        } else {
          entry.expenses += transaction.amount;
          entry.net -= transaction.amount;
        }
        historicalMap.set(key, entry);
      }
    });

    const points: {
      date: string;
      value: number;
      isProjection: boolean;
      revenues: number;
      expenses: number;
      subscriptions: number;
    }[] = [];

    const projectionSummary = {
      revenues: 0,
      subscriptions: 0,
      plannedExpenses: 0,
      net: 0,
    };

    for (
      let cursor = new Date(start);
      cursor <= projectionEnd;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = cursor.toISOString().split("T")[0];
      const isProjection = cursor > end;
      let dayRevenues = 0;
      let dayExpenses = 0;
      let daySubscriptions = 0;
      let value = 0;

      if (isProjection) {
        const futureTx = futureMap.get(key);
        if (futureTx) {
          dayRevenues += futureTx.incomes;
          dayExpenses += futureTx.expenses;
        }

        (normalizedRecurringIncomes || []).forEach((income) => {
          if (income.isRecurring && shouldTriggerRecurringIncome(income, cursor, today)) {
            dayRevenues += income.amount;
          }
        });

        (filteredData.subscriptions || []).forEach((subscription) => {
          daySubscriptions += getSubscriptionChargeForDate(subscription, cursor);
        });

        value = dayRevenues - dayExpenses - daySubscriptions;

        projectionSummary.revenues += dayRevenues;
        projectionSummary.plannedExpenses += dayExpenses;
        projectionSummary.subscriptions += daySubscriptions;
        projectionSummary.net += value;
      } else {
        const hist = historicalMap.get(key);
        if (hist) {
          dayRevenues = hist.incomes;
          dayExpenses = hist.expenses;
          value = hist.net;
        }
      }

      points.push({
        date: key,
        value,
        isProjection,
        revenues: dayRevenues,
        expenses: dayExpenses,
        subscriptions: daySubscriptions,
      });
    }

    return { points, start, end, projectionEnd, projectionSummary };
  }, [
    filteredData.transactions,
    filteredData.subscriptions,
    normalizedRecurringIncomes,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header avec sélecteur de compte */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
            <p className="text-gray-500">
              Vos finances du mois de{" "}
              <span className="font-semibold text-gray-900 capitalize">
                {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <WidgetSettings preferences={preferences} onSave={handleSavePreferences} />
            <Link href="/dashboard/incomes">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                Revenu
              </Button>
            </Link>
            <Link href="/dashboard/expenses">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                Dépense
              </Button>
            </Link>
          </div>
        </div>

        {/* Sélecteur de compte */}
        {accounts.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <AccountSelector 
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={handleSelectAccount}
            />
            {selectedAccount && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${selectedAccount.color || "#6B7280"}15`,
                    color: selectedAccount.color || "#6B7280"
                  }}
                >
                  {selectedAccount.type === 'checking' && 'Compte courant'}
                  {selectedAccount.type === 'savings' && 'Épargne'}
                  {selectedAccount.type === 'investment' && 'Investissement'}
                  {selectedAccount.type === 'crypto' && 'Crypto'}
                </span>
                {selectedAccount.bank && (
                  <span className="text-gray-400">• {selectedAccount.bank}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cartes KPIs Intelligentes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Solde Réel - adapté au compte sélectionné */}
        {preferences.balance && (
          <Card className={`relative overflow-hidden border-none shadow-xl ${
            selectedAccount?.type === 'savings' 
              ? 'bg-gradient-to-br from-green-800 via-green-700 to-green-800' 
              : selectedAccount?.type === 'investment'
              ? 'bg-gradient-to-br from-purple-800 via-purple-700 to-purple-800'
              : selectedAccount?.type === 'crypto'
              ? 'bg-gradient-to-br from-orange-800 via-orange-700 to-orange-800'
              : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          } text-white`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {selectedAccount?.type === 'savings' ? (
                <PiggyBank className="h-24 w-24" />
              ) : selectedAccount?.type === 'investment' ? (
                <TrendingUpIcon className="h-24 w-24" />
              ) : selectedAccount?.type === 'crypto' ? (
                <Coins className="h-24 w-24" />
              ) : (
                <Wallet className="h-24 w-24" />
              )}
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">
                {selectedAccount ? selectedAccount.name : 'Patrimoine total'}
              </CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tight">
                {formatCurrency(filteredData.balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-300 mt-4">
                <div className={`w-2 h-2 rounded-full ${filteredData.balance >= 0 ? "bg-green-400" : "bg-red-400"}`}></div>
                <span>
                  {selectedAccount?.type === 'savings' && 'Épargne disponible'}
                  {selectedAccount?.type === 'investment' && 'Valeur du portefeuille'}
                  {selectedAccount?.type === 'crypto' && 'Valeur crypto'}
                  {selectedAccount?.type === 'checking' && 'Trésorerie disponible'}
                  {!selectedAccount && 'Patrimoine consolidé'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Météo Financière (Prévision) */}
        {preferences.forecast && (
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <CardDescription className="text-blue-700 font-medium">
                  Projection fin de mois
                </CardDescription>
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900">
                ~ {formatCurrency(projectedBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-600 mt-2">
                Il reste <span className="font-bold">{formatCurrency(pendingSubscriptionCost)}</span>{" "}
                d&apos;abonnements à payer ce mois-ci.
              </div>
              <div className="mt-3 w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      ((totalSubscriptionCost - pendingSubscriptionCost) / totalSubscriptionCost) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-blue-400 mt-1 text-right">Abonnements payés</p>
            </CardContent>
          </Card>
        )}

        {/* Résumé des Flux - adapté au compte */}
        {preferences.flows && (
          <Card className="bg-white shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardDescription>
                {selectedAccount?.type === 'savings' && 'Mouvements épargne'}
                {selectedAccount?.type === 'investment' && 'Performance'}
                {selectedAccount?.type === 'crypto' && 'Mouvements crypto'}
                {selectedAccount?.type === 'checking' && 'Flux mensuels'}
                {!selectedAccount && 'Flux mensuels'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedAccount?.type === 'savings' ? 'Versements' : 
                     selectedAccount?.type === 'investment' ? 'Apports' :
                     selectedAccount?.type === 'crypto' ? 'Achats/Dépôts' : 'Entrées'}
                  </span>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(filteredData.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-red-100 rounded">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedAccount?.type === 'savings' ? 'Retraits' : 
                     selectedAccount?.type === 'investment' ? 'Retraits' :
                     selectedAccount?.type === 'crypto' ? 'Ventes/Retraits' : 'Sorties & Abos'}
                  </span>
                </div>
                <span className="font-bold text-red-600">{formatCurrency(filteredData.totalExpenseReal)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-center text-xs text-gray-500">
                <span>
                  {selectedAccount?.type === 'savings' ? 'Taux d\'épargne' :
                   selectedAccount?.type === 'investment' ? 'Rendement' :
                   selectedAccount?.type === 'crypto' ? 'Variation' : 'Taux d\'épargne'}
                </span>
                <span className={filteredData.balance > 0 ? "text-green-600 font-bold" : "text-gray-500"}>
                  {filteredData.totalIncome > 0 ? Math.round(((filteredData.totalIncome - filteredData.totalExpenseReal) / filteredData.totalIncome) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Zone principale */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Colonne principale */}
        <div className="md:col-span-5 space-y-6">
          {/* Graphique Principal - Évolution avancée - filtré par compte */}
          {preferences.chart && (
            <BalanceEvolution
              transactions={filteredData.transactions}
              subscriptions={filteredData.subscriptions}
              recurringIncomes={normalizedRecurringIncomes}
              currentBalance={filteredData.balance}
            />
          )}

          {/* Heatmap quotidienne */}
          {preferences.heatmap && heatmapRange && (
            <BalanceHeatmap
              data={heatmapRange.points}
              startDate={heatmapRange.start}
              endDate={heatmapRange.end}
              projectionEndDate={heatmapRange.projectionEnd}
              projectionSummary={heatmapRange.projectionSummary}
            />
          )}

          {/* Grille 2 colonnes */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Camembert */}
            {preferences.pie && (
              <Card className="shadow-sm border-slate-100">
                <CardHeader>
                  <CardTitle className="text-lg">Répartition dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingPieChart data={pieChartData} />
                </CardContent>
              </Card>
            )}

            {/* Widget Objectifs */}
            {preferences.goals && <WidgetGoals goals={goals} />}

            {/* Widget Abonnements */}
            {preferences.subscriptions && <WidgetSubscriptions subscriptions={subscriptions} />}

            {/* Widget Comptes bancaires */}
            {preferences.accounts && <WidgetAccounts accounts={accounts} />}

            {/* Carte Conseil - adapté au type de compte */}
            {preferences.advice && (
              <Card className={`flex flex-col justify-center ${
                selectedAccount?.type === 'savings' ? 'bg-green-50 border-green-100' :
                selectedAccount?.type === 'investment' ? 'bg-purple-50 border-purple-100' :
                selectedAccount?.type === 'crypto' ? 'bg-orange-50 border-orange-100' :
                'bg-amber-50 border-amber-100'
              }`}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedAccount?.type === 'savings' ? 'bg-green-100' :
                    selectedAccount?.type === 'investment' ? 'bg-purple-100' :
                    selectedAccount?.type === 'crypto' ? 'bg-orange-100' :
                    'bg-amber-100'
                  }`}>
                    {selectedAccount?.type === 'savings' ? (
                      <PiggyBank className="h-6 w-6 text-green-600" />
                    ) : selectedAccount?.type === 'investment' ? (
                      <TrendingUpIcon className="h-6 w-6 text-purple-600" />
                    ) : selectedAccount?.type === 'crypto' ? (
                      <Coins className="h-6 w-6 text-orange-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      selectedAccount?.type === 'savings' ? 'text-green-900' :
                      selectedAccount?.type === 'investment' ? 'text-purple-900' :
                      selectedAccount?.type === 'crypto' ? 'text-orange-900' :
                      'text-amber-900'
                    }`}>
                      {selectedAccount?.type === 'savings' ? 'Conseil Épargne' :
                       selectedAccount?.type === 'investment' ? 'Conseil Investissement' :
                       selectedAccount?.type === 'crypto' ? 'Conseil Crypto' :
                       'Analyse rapide'}
                    </h3>
                    <p className={`mt-2 text-sm ${
                      selectedAccount?.type === 'savings' ? 'text-green-700' :
                      selectedAccount?.type === 'investment' ? 'text-purple-700' :
                      selectedAccount?.type === 'crypto' ? 'text-orange-700' :
                      'text-amber-700'
                    }`}>
                      {filteredData.balance > 0 ? accountAdvice.positive : accountAdvice.negative}
                    </p>
                  </div>
                  {selectedAccount?.type === 'savings' && (
                    <Link href="/dashboard/goals">
                      <Button variant="outline" className="border-green-200 text-green-800 hover:bg-green-100">
                        Définir un objectif
                      </Button>
                    </Link>
                  )}
                  {selectedAccount?.type === 'investment' && (
                    <AccountTypeInfo type="investment" />
                  )}
                  {selectedAccount?.type === 'crypto' && (
                    <AccountTypeInfo type="crypto" />
                  )}
                  {(!selectedAccount || selectedAccount.type === 'checking') && (
                    <Link href="/dashboard/goals">
                      <Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100">
                        Voir mes objectifs
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar: Activité */}
        {preferences.activity && (
          <div className="md:col-span-2 space-y-6">
            <WidgetActivity
              activities={recentActivity}
              accountLabel={selectedAccount ? selectedAccount.name : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

