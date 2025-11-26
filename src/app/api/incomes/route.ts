import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { incomeSchema } from '@/lib/validations';

// Force dynamic to ensure session is checked on every request
export const dynamic = 'force-dynamic';

// GET - Liste des revenus
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.log('[API_INCOMES_GET] Unauthorized: No session or user ID');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const incomes = await prisma.income.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error('[API_INCOMES_GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un revenu
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('[API_INCOMES_POST] Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Vous devez être connecté pour effectuer cette action' }, { status: 401 });
    }

    const body = await req.json();

    // Validation
    const validated = incomeSchema.safeParse({
      ...body,
      date: new Date(body.date),
    });

    if (!validated.success) {
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: validated.error.flatten() 
      }, { status: 400 });
    }

    const income = await prisma.income.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('[API_INCOMES_POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
