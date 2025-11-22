import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subscriptionSchema } from '@/lib/validations';

// GET - Liste des abonnements
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un abonnement
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validation
    const validated = subscriptionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

