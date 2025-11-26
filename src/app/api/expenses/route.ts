import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema } from '@/lib/validations';

// Force dynamic to ensure session is checked on every request
export const dynamic = 'force-dynamic';

// GET - Liste des dépenses
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log('[API_EXPENSES_GET] Unauthorized: No session or user ID');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('[API_EXPENSES_GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une dépense
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('[API_EXPENSES_POST] Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Vous devez être connecté pour effectuer cette action' }, { status: 401 });
    }

    const body = await req.json();

    // Validation
    const validated = expenseSchema.safeParse({
      ...body,
      date: new Date(body.date),
    });

    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Données invalides',
        details: validated.error.flatten() 
      }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('[API_EXPENSES_POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
