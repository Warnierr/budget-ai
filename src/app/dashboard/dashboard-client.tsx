"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { SpendingPieChart } from "@/components/charts/spending-pie";
import { BalanceEvolution } from "@/components/charts/balance-evolution";
import { WidgetGoals } from "@/components/dashboard/widget-goals";
import { WidgetSubscriptions } from "@/components/dashboard/widget-subscriptions";
import { WidgetAccounts } from "@/components/dashboard/widget-accounts";
import { WidgetSettings, WidgetPreferences } from "@/components/dashboard/widget-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CalendarRange,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Plus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = 'budget-ai-dashboard-widgets';

interface DashboardClientProps {
  data: {
    balance: number;
    totalIncome: number;
    totalExpenseReal: number;
    projectedBalance: number;
    pendingSubscriptionCost: number;
    totalSubscriptionCost: number;
    pieData: Array<{ name: string; value: number; color?: string }>;
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
    }>;
    recurringIncomes: Array<{
      id: string;
      name: string;
      amount: number;
      frequency: string;
      isRecurring: boolean;
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

export function DashboardClient({ data, initialPreferences }: DashboardClientProps) {
  const [preferences, setPreferences] = useState<WidgetPreferences>(initialPreferences);
  const { toast } = useToast();

  // Charger les préférences depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...initialPreferences, ...parsed });
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }, [initialPreferences]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
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
        <div className="flex gap-2">
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

      {/* Cartes KPIs Intelligentes */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Solde Réel */}
        {preferences.balance && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-none shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">Solde actuel</CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tight">
                {formatCurrency(balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-300 mt-4">
                <div className={`w-2 h-2 rounded-full ${balance >= 0 ? "bg-green-400" : "bg-red-400"}`}></div>
                <span>Trésorerie disponible instantanée</span>
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

        {/* Résumé des Flux */}
        {preferences.flows && (
          <Card className="bg-white shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardDescription>Flux mensuels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Entrées</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-red-100 rounded">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-600">Sorties & Abos</span>
                </div>
                <span className="font-bold text-red-600">{formatCurrency(totalExpenseReal)}</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-center text-xs text-gray-500">
                <span>Taux d&apos;épargne</span>
                <span className={balance > 0 ? "text-green-600 font-bold" : "text-gray-500"}>
                  {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
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
          {/* Graphique Principal - Évolution avancée */}
          {preferences.chart && (
            <BalanceEvolution
              transactions={allTransactions}
              subscriptions={subscriptions}
              recurringIncomes={recurringIncomes}
              currentBalance={balance}
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
                  <SpendingPieChart data={pieData} />
                </CardContent>
              </Card>
            )}

            {/* Widget Objectifs */}
            {preferences.goals && <WidgetGoals goals={goals} />}

            {/* Widget Abonnements */}
            {preferences.subscriptions && <WidgetSubscriptions subscriptions={subscriptions} />}

            {/* Widget Comptes bancaires */}
            {preferences.accounts && <WidgetAccounts accounts={accounts} />}

            {/* Carte Conseil */}
            {preferences.advice && (
              <Card className="bg-amber-50 border-amber-100 flex flex-col justify-center">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg">Analyse rapide</h3>
                    <p className="text-amber-700 mt-2 text-sm">
                      {balance > 0
                        ? "🎉 Vous êtes dans le vert ! C'est le moment idéal pour mettre de côté dans vos Objectifs."
                        : "⚠️ Attention, vos dépenses dépassent vos revenus ce mois-ci. Vérifiez vos abonnements."}
                    </p>
                  </div>
                  <Link href="/dashboard/goals">
                    <Button
                      variant="outline"
                      className="border-amber-200 text-amber-800 hover:bg-amber-100"
                    >
                      Voir mes objectifs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar: Activité */}
        {preferences.activity && (
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm border-slate-100 h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-gray-500" />
                  Derniers mouvements
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="space-y-6">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Aucune activité.</p>
                  ) : (
                    recentActivity.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`
                            min-w-8 w-8 h-8 rounded-full flex items-center justify-center
                            ${item.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}
                          `}
                          >
                            {item.type === "income" ? (
                              <Plus className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-sm font-bold whitespace-nowrap ${
                            item.type === "income" ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(item.amount))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-4 border-t text-center">
                  <Link
                    href="/dashboard/expenses"
                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1"
                  >
                    Tout voir <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

