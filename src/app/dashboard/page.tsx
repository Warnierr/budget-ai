import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getFirstDayOfMonth, getLastDayOfMonth } from "@/lib/utils";
import { DashboardClient } from "./dashboard-client";

export const dynamic = 'force-dynamic';

// Préférences par défaut
const DEFAULT_PREFERENCES = {
  balance: true,
  forecast: true,
  flows: true,
  chart: true,
  heatmap: true,
  pie: true,
  goals: true,
  subscriptions: true,
  accounts: true,
  activity: true,
  advice: true,
} as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const today = new Date();
  const startDate = getFirstDayOfMonth();
  const endDate = getLastDayOfMonth();

  // Date de début étendue pour l'historique (6 mois en arrière)
  const historicalStartDate = new Date();
  historicalStartDate.setMonth(historicalStartDate.getMonth() - 6);
  historicalStartDate.setDate(1);

  // 1. Récupération massive des données
  const [
    // Revenus du mois courant
    incomes, 
    // Dépenses du mois courant
    expenses, 
    // Tous les abonnements
    subscriptions,
    // Objectifs
    goals,
    // Comptes bancaires
    bankAccounts,
    // Groupement par catégorie (mois courant)
    expensesByCategory,
    // Catégories
    allCategories,
    // NOUVEAU: Historique complet des revenus (6 mois)
    allIncomes,
    // NOUVEAU: Historique complet des dépenses (6 mois)
    allExpenses,
  ] = await Promise.all([
    // Revenus du mois courant
    prisma.income.findMany({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    }),
    // Dépenses du mois courant
    prisma.expense.findMany({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    }),
    // Tous les abonnements
    prisma.subscription.findMany({
      where: { userId: session.user.id },
    }),
    // Objectifs
    prisma.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    }),
    // Comptes bancaires
    prisma.bankAccount.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
    }),
    // Groupement par catégorie
    prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    // Catégories
    prisma.category.findMany({
      where: { OR: [{ userId: session.user.id }, { isDefault: true }] }
    }),
    // NOUVEAU: Historique complet des revenus
    prisma.income.findMany({
      where: { userId: session.user.id, date: { gte: historicalStartDate } },
      orderBy: { date: 'asc' }
    }),
    // NOUVEAU: Historique complet des dépenses
    prisma.expense.findMany({
      where: { userId: session.user.id, date: { gte: historicalStartDate } },
      orderBy: { date: 'asc' }
    }),
  ]);

  // 2. Calculs des Totaux (mois courant)
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenseVariable = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Estimation des abonnements mensuels
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const totalSubscriptionCost = activeSubscriptions.reduce((sum, s) => {
    return sum + (s.frequency === 'monthly' ? s.amount : s.amount / 12);
  }, 0);

  const totalExpenseReal = totalExpenseVariable; 
  const balance = totalIncome - totalExpenseReal;

  // 3. Intelligence Prévisionnelle
  const currentDay = today.getDate();
  const pendingSubscriptions = activeSubscriptions.filter(s => s.billingDate > currentDay);
  const pendingSubscriptionCost = pendingSubscriptions.reduce((sum, s) => sum + s.amount, 0);
  const projectedBalance = balance - pendingSubscriptionCost;

  // Données pour le camembert
  const pieData = expensesByCategory.map(item => {
    const category = allCategories.find(c => c.id === item.categoryId);
    const color = category?.color ?? "#94a3b8";
    return {
      name: category?.name || 'Non classé',
      value: item._sum.amount || 0,
      color,
    };
  }).sort((a, b) => b.value - a.value);

  // Activité récente fusionnée (mois courant)
  const recentActivity = [
    ...incomes.map(i => ({ 
      id: i.id,
      name: i.name,
      amount: i.amount,
      date: i.date.toISOString(),
      type: 'income' as const 
    })),
    ...expenses.map(e => ({ 
      id: e.id,
      name: e.name,
      amount: e.amount,
      date: e.date.toISOString(),
      type: 'expense' as const 
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, 5);

  // NOUVEAU: Toutes les transactions pour le graphique avancé (avec bankAccountId)
  const allTransactions = [
    ...allIncomes.map(i => ({ 
      id: i.id,
      name: i.name,
      amount: i.amount,
      date: i.date.toISOString(),
      type: 'income' as const,
      bankAccountId: i.bankAccountId,
    })),
    ...allExpenses.map(e => ({ 
      id: e.id,
      name: e.name,
      amount: e.amount,
      date: e.date.toISOString(),
      type: 'expense' as const,
      bankAccountId: e.bankAccountId,
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // NOUVEAU: Revenus récurrents pour les projections
  const recurringIncomes = allIncomes
    .filter(i => i.isRecurring)
    .map(i => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      frequency: i.frequency,
      isRecurring: i.isRecurring,
      startDate: i.date.toISOString(),
    }));

  // Formater les objectifs
  const formattedGoals = goals.map(g => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    deadline: g.deadline?.toISOString() || null,
    isCompleted: g.isCompleted,
  }));

  // Formater les abonnements (avec bankAccountId)
  const formattedSubscriptions = subscriptions.map(s => ({
    id: s.id,
    name: s.name,
    amount: s.amount,
    frequency: s.frequency,
    billingDate: s.billingDate,
    isActive: s.isActive,
    bankAccountId: s.bankAccountId,
  }));

  // Formater les comptes bancaires avec soldes calculés
  const formattedAccounts = await Promise.all(
    bankAccounts.map(async (account) => {
      const [incomeSum, expenseSum] = await Promise.all([
        prisma.income.aggregate({
          where: { bankAccountId: account.id, date: { lte: today } },
          _sum: { amount: true }
        }),
        prisma.expense.aggregate({
          where: { bankAccountId: account.id, date: { lte: today } },
          _sum: { amount: true }
        })
      ]);

      const currentBalance = 
        account.initialBalance + 
        (incomeSum._sum.amount || 0) - 
        (expenseSum._sum.amount || 0);

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        bank: account.bank,
        currentBalance,
        color: account.color,
        isDefault: account.isDefault,
      };
    })
  );

  // Préparer les données pour le client
  const dashboardData = {
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
    goals: formattedGoals,
    subscriptions: formattedSubscriptions,
    accounts: formattedAccounts,
  };

  return (
    <DashboardClient 
      data={dashboardData} 
      initialPreferences={DEFAULT_PREFERENCES} 
    />
  );
}
