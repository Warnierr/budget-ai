import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  chatWithFinancialContext,
  chatWithAssistant,
  streamChatWithFinancialContext,
  streamChatCompletion,
  Message,
  RawFinancialData,
  PrivacyPreferences,
  DEFAULT_PRIVACY_PREFERENCES,
} from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

// POST - Envoyer un message au chat IA
export async function POST(req: NextRequest) {
  console.log('--- AI CHAT REQUEST START ---');
  const session = await getServerSession(authOptions);
  console.log('Session user ID:', session?.user?.id);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('AI Chat: API Key raw:', apiKey);

    // Protection contre les variables d'env Windows non résolues (%VAR%)
    if (!apiKey || apiKey.includes("%")) {
      console.error("[Chat API] ERROR: OPENROUTER_API_KEY is missing or invalid (contains %)");
      return NextResponse.json({
        error: 'Service IA non configuré. Veuillez vérifier la clé API dans .env.'
      }, { status: 500 });
    }

    const body = await req.json();
    const {
      message,
      conversationHistory = [],
      includeFinancialContext = true,
      privacyPreferences = DEFAULT_PRIVACY_PREFERENCES,
      model,
    } = body;
    const selectedModel = typeof model === 'string' ? model : undefined;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    if (includeFinancialContext) {
      // Récupérer les données financières de l'utilisateur
      const rawData = await getUserFinancialData(session.user.id);

      // Info de confidentialité pour les headers
      const privacyInfo = {
        level: privacyPreferences.level,
        sharedCategories: Object.entries(privacyPreferences)
          .filter(([key, value]) => key.startsWith('share') && value)
          .map(([key]) => key.replace('share', ''))
      };

      // Création du stream
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            const iterator = streamChatWithFinancialContext(
              rawData,
              conversationHistory as Message[],
              message,
              privacyPreferences as PrivacyPreferences,
              { model: selectedModel }
            );

            for await (const chunk of iterator) {
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (e) {
            console.error("Stream error:", e);
            controller.error(e);
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Privacy-Info': JSON.stringify(privacyInfo)
        }
      });

    } else {
      // Chat sans contexte financier (Streaming aussi)
      // Construire les messages manuellement
      const systemMsg = { role: 'system', content: 'Tu es un assistant financier.' } as Message;
      const msgs = [systemMsg, ...conversationHistory, { role: 'user', content: message }] as Message[];

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            const iterator = streamChatCompletion({
              messages: msgs,
              model: selectedModel
            });

            for await (const chunk of iterator) {
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (e) {
            console.error(e);
            controller.error(e);
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

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
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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
        incomes: {
          where: { date: { lte: today } },
          select: { amount: true },
        },
        expenses: {
          where: { date: { lte: today } },
          select: { amount: true },
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

  const realizedIncomes = incomes.filter((income) => income.date <= today);
  const realizedExpenses = expenses.filter((expense) => expense.date <= today);

  const totalIncome = realizedIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = realizedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSubscriptions = subscriptions.reduce((sum, s) => {
    return sum + (s.frequency === 'monthly' ? s.amount : s.amount / 12);
  }, 0);
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const freeToSpend = totalIncome - totalExpenses - totalSubscriptions;

  const [futureIncomes, futureExpenses] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gt: now } },
      orderBy: { date: 'asc' },
      take: 8,
      select: {
        id: true,
        name: true,
        amount: true,
        date: true,
        frequency: true,
        isRecurring: true,
      },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gt: now } },
      orderBy: { date: 'asc' },
      take: 8,
      select: {
        id: true,
        name: true,
        amount: true,
        date: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  // Transformer les données au format RawFinancialData
  return {
    accounts: accounts.map(a => {
      const totalIncome = a.incomes.reduce((sum, i) => sum + i.amount, 0);
      const totalExpense = a.expenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.initialBalance + totalIncome - totalExpense,
      };
    }),

    incomes: realizedIncomes.map(i => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      date: i.date.toISOString(),
      category: i.frequency === 'monthly' ? 'Salaire' : 'Autre revenu',
      isRecurring: i.isRecurring,
    })),

    expenses: realizedExpenses.map(e => ({
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
    summary: {
      monthLabel,
      currentMonthIncome: totalIncome,
      currentMonthExpenses: totalExpenses,
      fixedCharges: totalSubscriptions,
      freeToSpend,
    },
    upcomingIncomes: futureIncomes.map(i => ({
      amount: i.amount,
      date: i.date.toISOString(),
      category: i.frequency === 'monthly' ? 'Revenu récurrent' : 'Revenu ponctuel',
      isRecurring: i.isRecurring,
    })),
    upcomingExpenses: futureExpenses.map(e => ({
      amount: e.amount,
      date: e.date.toISOString(),
      category: e.category?.name || 'Dépense planifiée',
    })),
  };
}
