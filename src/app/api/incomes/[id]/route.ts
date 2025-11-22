import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Supprimer un revenu
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Vérifier que le revenu appartient bien à l'utilisateur
    const income = await prisma.income.findUnique({
      where: { id: params.id },
    });

    if (!income || income.userId !== session.user.id) {
      return NextResponse.json({ error: 'Revenu non trouvé' }, { status: 404 });
    }

    await prisma.income.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Revenu supprimé' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

