import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema } from '@/lib/validations';

// DELETE - Supprimer une dépense
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Vérifier que la dépense appartient bien à l'utilisateur
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Dépense supprimée' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Mettre à jour une dépense
const partialExpenseSchema = expenseSchema.partial();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Vérifier que la dépense appartient bien à l'utilisateur
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ error: 'Dépense non trouvée' }, { status: 404 });
    }

    const validated = partialExpenseSchema.safeParse({
      ...body,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      date: body.date ? new Date(body.date) : undefined,
    });

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      ...validated.data,
    };

    if (body.date) {
      updateData.date = validated.data.date;
    }

    if (body.bankAccountId !== undefined) {
      updateData.bankAccountId = body.bankAccountId || null;
    }

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

