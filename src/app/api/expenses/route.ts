import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// GET - Liste des dépenses
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        bankAccount: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une dépense
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validation
    const validated = expenseSchema.safeParse({
      ...body,
      date: new Date(body.date),
    });

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        ...validated.data,
        userId: session.user.id,
        bankAccountId: body.bankAccountId || null,
      },
      include: {
        category: true,
        bankAccount: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

