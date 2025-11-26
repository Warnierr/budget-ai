"use client";

import { useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Wallet, PiggyBank, AlertTriangle } from "lucide-react";

// Types
interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  billingDate: number;
  isActive: boolean;
}

interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  isRecurring: boolean;
}

interface BalanceEvolutionProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  recurringIncomes: RecurringIncome[];
  currentBalance: number;
}

type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: "1D", label: "1J", days: 1 },
  { key: "1W", label: "1S", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "1Y", label: "1A", days: 365 },
  { key: "ALL", label: "Tout", days: 9999 },
];

export function BalanceEvolution({
  transactions,
  subscriptions,
  recurringIncomes,
  currentBalance,
}: BalanceEvolutionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1M");
  const [showProjection, setShowProjection] = useState(true);

  // Calcul des données du graphique
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const periodConfig = PERIODS.find((p) => p.key === selectedPeriod)!;
    
    // Déterminer les dates de début et fin
    let startDate: Date;
    let endDate: Date;
    let projectionMonths = 0;

    if (selectedPeriod === "ALL") {
      // Trouver la plus ancienne transaction
      const allDates = transactions.map((t) => new Date(t.date));
      startDate = allDates.length > 0 
        ? new Date(Math.min(...allDates.map((d) => d.getTime())))
        : new Date(today.getFullYear(), today.getMonth() - 6, 1);
      endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 3); // Projection 3 mois
      projectionMonths = 3;
    } else if (selectedPeriod === "3M") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1); // 1 mois passé
      endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 2); // 2 mois futur
      projectionMonths = 2;
    } else if (selectedPeriod === "1Y") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6); // 6 mois passé
      endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6); // 6 mois futur
      projectionMonths = 6;
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - periodConfig.days);
      endDate = new Date(today);
      if (selectedPeriod === "1M") {
        endDate.setMonth(endDate.getMonth() + 1);
        projectionMonths = 1;
      }
    }

    // Créer un tableau de jours
    const data: {
      date: string;
      fullDate: Date;
      soldeReel: number | null;
      soldeProjection: number | null;
      revenus: number;
      depenses: number;
      abonnements: number;
      isProjection: boolean;
    }[] = [];

    // Calculer le solde de départ (remonter dans le temps)
    let runningBalance = currentBalance;
    
    // Soustraire toutes les transactions après startDate pour avoir le solde de départ
    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate >= startDate && tDate <= today) {
        if (t.type === "income") {
          runningBalance -= t.amount;
        } else {
          runningBalance += t.amount;
        }
      }
    });

    const startBalance = runningBalance;
    runningBalance = startBalance;

    // Parcourir chaque jour
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      
      const isProjection = currentDate > today;
      const dayOfMonth = currentDate.getDate();

      // Revenus du jour
      let dayRevenues = 0;
      let dayExpenses = 0;
      let daySubscriptions = 0;

      if (!isProjection) {
        // Données réelles
        transactions.forEach((t) => {
          const tDate = new Date(t.date);
          if (
            tDate.getDate() === currentDate.getDate() &&
            tDate.getMonth() === currentDate.getMonth() &&
            tDate.getFullYear() === currentDate.getFullYear()
          ) {
            if (t.type === "income") {
              dayRevenues += t.amount;
            } else {
              dayExpenses += t.amount;
            }
          }
        });
      } else {
        // Projection : ajouter les revenus récurrents
        recurringIncomes
          .filter((r) => r.isRecurring)
          .forEach((r) => {
            // Supposer que les revenus récurrents arrivent le 1er ou le 25 du mois
            if (dayOfMonth === 1 || dayOfMonth === 25) {
              if (r.frequency === "monthly") {
                dayRevenues += r.amount / 2; // Divisé car on check 2 jours
              }
            }
          });

        // Ajouter les abonnements projetés
        subscriptions
          .filter((s) => s.isActive)
          .forEach((s) => {
            if (s.billingDate === dayOfMonth) {
              if (s.frequency === "monthly") {
                daySubscriptions += s.amount;
              } else if (s.frequency === "yearly") {
                // Abonnement annuel - vérifier si c'est le mois
                daySubscriptions += s.amount / 12; // Lissé
              }
            }
          });
      }

      runningBalance += dayRevenues - dayExpenses - daySubscriptions;

      data.push({
        date: dateStr,
        fullDate: new Date(currentDate),
        soldeReel: isProjection ? null : runningBalance,
        soldeProjection: isProjection ? runningBalance : null,
        revenus: dayRevenues,
        depenses: dayExpenses,
        abonnements: daySubscriptions,
        isProjection,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Simplifier les données selon la période (ne pas afficher tous les jours pour les longues périodes)
    if (selectedPeriod === "1Y" || selectedPeriod === "ALL") {
      // Grouper par semaine
      const weeklyData: typeof data = [];
      for (let i = 0; i < data.length; i += 7) {
        const weekSlice = data.slice(i, i + 7);
        if (weekSlice.length > 0) {
          const lastDay = weekSlice[weekSlice.length - 1];
          weeklyData.push({
            ...lastDay,
            date: lastDay.fullDate.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            }),
            revenus: weekSlice.reduce((s, d) => s + d.revenus, 0),
            depenses: weekSlice.reduce((s, d) => s + d.depenses, 0),
            abonnements: weekSlice.reduce((s, d) => s + d.abonnements, 0),
          });
        }
      }
      return weeklyData;
    }

    if (selectedPeriod === "3M") {
      // Grouper par 3 jours
      const groupedData: typeof data = [];
      for (let i = 0; i < data.length; i += 3) {
        const slice = data.slice(i, i + 3);
        if (slice.length > 0) {
          const lastDay = slice[slice.length - 1];
          groupedData.push({
            ...lastDay,
            revenus: slice.reduce((s, d) => s + d.revenus, 0),
            depenses: slice.reduce((s, d) => s + d.depenses, 0),
            abonnements: slice.reduce((s, d) => s + d.abonnements, 0),
          });
        }
      }
      return groupedData;
    }

    return data;
  }, [transactions, subscriptions, recurringIncomes, currentBalance, selectedPeriod]);

  // Statistiques
  const stats = useMemo(() => {
    const projectedData = chartData.filter((d) => d.isProjection);
    const realData = chartData.filter((d) => !d.isProjection);

    const finalProjectedBalance = projectedData.length > 0 
      ? projectedData[projectedData.length - 1].soldeProjection 
      : null;
    
    const currentBalanceFromData = realData.length > 0 
      ? realData[realData.length - 1].soldeReel 
      : currentBalance;

    const monthlySubscriptionsCost = subscriptions
      .filter((s) => s.isActive)
      .reduce((sum, s) => sum + (s.frequency === "yearly" ? s.amount / 12 : s.amount), 0);

    const monthlyRecurringIncome = recurringIncomes
      .filter((r) => r.isRecurring)
      .reduce((sum, r) => sum + (r.frequency === "monthly" ? r.amount : r.amount / 12), 0);

    const freeToSpend = monthlyRecurringIncome - monthlySubscriptionsCost;

    return {
      currentBalance: currentBalanceFromData,
      projectedBalance: finalProjectedBalance,
      monthlySubscriptionsCost,
      monthlyRecurringIncome,
      freeToSpend,
      variation: finalProjectedBalance && currentBalanceFromData 
        ? finalProjectedBalance - currentBalanceFromData 
        : 0,
    };
  }, [chartData, currentBalance, subscriptions, recurringIncomes]);

  // Trouver le minimum et maximum pour l'axe Y
  const yDomain = useMemo(() => {
    const allValues = chartData
      .map((d) => d.soldeReel ?? d.soldeProjection ?? 0)
      .filter((v) => v !== null);
    
    if (allValues.length === 0) return [0, 1000];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  return (
    <Card className="shadow-sm border-slate-100">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Évolution du solde
            </CardTitle>
            <CardDescription>
              Historique et projection de votre trésorerie
            </CardDescription>
          </div>

          {/* Sélecteur de période */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {PERIODS.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-3 text-xs font-medium ${
                  selectedPeriod === period.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedPeriod(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Wallet className="h-3 w-3" />
              Solde actuel
            </div>
            <p className={`text-lg font-bold ${stats.currentBalance && stats.currentBalance >= 0 ? "text-gray-900" : "text-red-600"}`}>
              {formatCurrency(stats.currentBalance || 0)}
            </p>
          </div>

          {showProjection && stats.projectedBalance !== null && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                <Calendar className="h-3 w-3" />
                Projection
              </div>
              <p className={`text-lg font-bold ${stats.projectedBalance >= 0 ? "text-blue-900" : "text-red-600"}`}>
                {formatCurrency(stats.projectedBalance)}
              </p>
              <p className={`text-xs ${stats.variation >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.variation >= 0 ? "+" : ""}{formatCurrency(stats.variation)}
              </p>
            </div>
          )}

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
              <PiggyBank className="h-3 w-3" />
              Libre/mois
            </div>
            <p className={`text-lg font-bold ${stats.freeToSpend >= 0 ? "text-green-700" : "text-red-600"}`}>
              {formatCurrency(stats.freeToSpend)}
            </p>
            <p className="text-xs text-gray-500">après charges fixes</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
              <AlertTriangle className="h-3 w-3" />
              Charges fixes
            </div>
            <p className="text-lg font-bold text-orange-700">
              {formatCurrency(stats.monthlySubscriptionsCost)}
            </p>
            <p className="text-xs text-gray-500">/mois en abos</p>
          </div>
        </div>

        {/* Toggle projection */}
        <div className="flex items-center gap-2">
          <Button
            variant={showProjection ? "default" : "outline"}
            size="sm"
            onClick={() => setShowProjection(!showProjection)}
            className="text-xs"
          >
            {showProjection ? "Masquer" : "Afficher"} la projection
          </Button>
          {showProjection && (
            <span className="text-xs text-gray-500">
              Inclut vos abonnements et revenus récurrents
            </span>
          )}
        </div>

        {/* Graphique */}
        <div className="h-[350px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Pas assez de données pour afficher le graphique
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSoldeReel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSoldeProjection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                  domain={yDomain}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      soldeReel: "Solde réel",
                      soldeProjection: "Projection",
                    };
                    return [formatCurrency(value), labels[name] || name];
                  }}
                  labelStyle={{ color: "#6b7280", marginBottom: "0.5rem", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      soldeReel: "Solde réel",
                      soldeProjection: "Projection",
                    };
                    return <span className="text-xs">{labels[value] || value}</span>;
                  }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
                <Area
                  type="monotone"
                  dataKey="soldeReel"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSoldeReel)"
                  name="soldeReel"
                  connectNulls={false}
                />
                {showProjection && (
                  <Area
                    type="monotone"
                    dataKey="soldeProjection"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorSoldeProjection)"
                    name="soldeProjection"
                    connectNulls={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Légende */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
            <span>Solde réel</span>
          </div>
          {showProjection && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-purple-500 rounded" style={{ borderStyle: "dashed" }}></div>
              <span>Projection (abos + revenus récurrents)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500 rounded" style={{ borderStyle: "dashed" }}></div>
            <span>Seuil zéro</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

