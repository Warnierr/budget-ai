import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Supprimer un abonnement
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Vérifier que l'abonnement appartient bien à l'utilisateur
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Abonnement non trouvé' }, { status: 404 });
    }

    await prisma.subscription.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Abonnement supprimé' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Mettre à jour (désactiver/activer) un abonnement
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Vérifier que l'abonnement appartient bien à l'utilisateur
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Abonnement non trouvé' }, { status: 404 });
    }

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: body,
      include: {
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

