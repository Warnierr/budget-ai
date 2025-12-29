import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeBudget, MonthlyData } from '@/lib/budget-advisor';

/**
 * GET /api/budget/analysis
 * Retourne l'analyse budgétaire de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les données du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Récupérer les revenus du mois
    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Récupérer les dépenses du mois (inclure la catégorie pour l'analyse)
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        category: true,
      },
    });

    // Récupérer les abonnements actifs
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    // Si pas de données ce mois, prendre les 3 derniers mois et faire une moyenne
    let monthlyData: MonthlyData;

    if (incomes.length === 0 && expenses.length === 0) {
      // Récupérer les 3 derniers mois
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      const allIncomes = await prisma.income.findMany({
        where: {
          userId,
          date: { gte: threeMonthsAgo },
        },
      });

      const allExpenses = await prisma.expense.findMany({
        where: {
          userId,
          date: { gte: threeMonthsAgo },
        },
        include: {
          category: true,
        },
      });

      // Calculer la moyenne mensuelle
      const monthsCount = Math.max(1, 3);

      monthlyData = {
        incomes: allIncomes.map((i) => ({
          amount: i.amount / monthsCount,
          category: i.name, // Use name as category for incomes
          description: i.description || '',
        })),
        expenses: allExpenses.map((e) => ({
          amount: e.amount / monthsCount,
          category: e.category?.name || e.name,
          description: e.description || '',
        })),
        subscriptions: subscriptions.map((s) => ({
          amount: s.amount,
          name: s.name,
        })),
      };
    } else {
      monthlyData = {
        incomes: incomes.map((i) => ({
          amount: i.amount,
          category: i.name,
          description: i.description || '',
        })),
        expenses: expenses.map((e) => ({
          amount: e.amount,
          category: e.category?.name || e.name,
          description: e.description || '',
        })),
        subscriptions: subscriptions.map((s) => ({
          amount: s.amount,
          name: s.name,
        })),
      };
    }

    // Analyser le budget
    const analysis = analyzeBudget(monthlyData);

    return NextResponse.json({
      success: true,
      analysis,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
      dataSource: incomes.length > 0 || expenses.length > 0 ? 'current_month' : 'average_3_months',
    });
  } catch (error) {
    console.error('Erreur analyse budget:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
