import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  chatWithFinancialContext,
  chatWithAssistant,
  Message,
  RawFinancialData,
  PrivacyPreferences,
  DEFAULT_PRIVACY_PREFERENCES,
} from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

// POST - Envoyer un message au chat IA
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      message, 
      conversationHistory = [], 
      includeFinancialContext = true,
      privacyPreferences = DEFAULT_PRIVACY_PREFERENCES,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    let response: string;

    if (includeFinancialContext) {
      // Récupérer les données financières de l'utilisateur
      const rawData = await getUserFinancialData(session.user.id);
      
      response = await chatWithFinancialContext(
        rawData,
        conversationHistory as Message[],
        message,
        privacyPreferences as PrivacyPreferences
      );
    } else {
      // Chat sans contexte financier
      response = await chatWithAssistant(
        conversationHistory as Message[],
        message
      );
    }

    return NextResponse.json({ 
      response,
      // Indiquer ce qui a été partagé (pour transparence)
      privacyInfo: includeFinancialContext ? {
        level: privacyPreferences.level,
        sharedCategories: Object.entries(privacyPreferences)
          .filter(([key, value]) => key.startsWith('share') && value)
          .map(([key]) => key.replace('share', ''))
      } : null
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Gérer les erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('OPENROUTER_API_KEY')) {
        return NextResponse.json({ 
          error: 'Service IA non configuré. Veuillez configurer OPENROUTER_API_KEY.' 
        }, { status: 503 });
      }
      if (error.message.includes('OpenRouter API error')) {
        return NextResponse.json({ 
          error: 'Erreur du service IA. Veuillez réessayer.' 
        }, { status: 502 });
      }
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * Récupère les données financières brutes de l'utilisateur
 * Ces données seront anonymisées avant envoi à l'IA
 */
async function getUserFinancialData(userId: string): Promise<RawFinancialData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [accounts, incomes, expenses, subscriptions, goals] = await Promise.all([
    // Comptes bancaires
    prisma.bankAccount.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        initialBalance: true,
        // Calculer le solde actuel
        incomes: { select: { amount: true } },
        expenses: { select: { amount: true } },
        subscriptions: { 
          where: { isActive: true },
          select: { amount: true, frequency: true } 
        },
      }
    }),

    // Revenus du mois
    prisma.income.findMany({
      where: { 
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      select: {
        id: true,
        name: true,
        amount: true,
        date: true,
        frequency: true,
        isRecurring: true,
      }
    }),

    // Dépenses du mois
    prisma.expense.findMany({
      where: { 
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      select: {
        id: true,
        name: true,
        amount: true,
        date: true,
        category: { select: { name: true } }
      }
    }),

    // Abonnements actifs
    prisma.subscription.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        amount: true,
        frequency: true,
        category: { select: { name: true } }
      }
    }),

    // Objectifs
    prisma.goal.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        currentAmount: true,
        deadline: true,
      }
    }),
  ]);

  // Transformer les données au format RawFinancialData
  return {
    accounts: accounts.map(a => {
      const totalIncome = a.incomes.reduce((sum, i) => sum + i.amount, 0);
      const totalExpense = a.expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalSubs = a.subscriptions.reduce((sum, s) => {
        return sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount);
      }, 0);
      
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.initialBalance + totalIncome - totalExpense - totalSubs,
      };
    }),

    incomes: incomes.map(i => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      date: i.date.toISOString(),
      category: i.frequency === 'monthly' ? 'Salaire' : 'Autre revenu',
      isRecurring: i.isRecurring,
    })),

    expenses: expenses.map(e => ({
      id: e.id,
      name: e.name,
      amount: e.amount,
      date: e.date.toISOString(),
      category: e.category?.name || 'Autre',
    })),

    subscriptions: subscriptions.map(s => ({
      id: s.id,
      name: s.name,
      amount: s.amount,
      frequency: s.frequency,
      category: s.category?.name,
    })),

    goals: goals.map(g => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline?.toISOString(),
    })),
  };
}

