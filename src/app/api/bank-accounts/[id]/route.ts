import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - Récupérer un compte spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            incomes: true,
            expenses: true,
            subscriptions: true,
          }
        }
      }
    });

    if (!bankAccount) {
      return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
    }

    // Calculer le solde actuel
    const [incomeSum, expenseSum] = await Promise.all([
      prisma.income.aggregate({
        where: { bankAccountId: bankAccount.id },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { bankAccountId: bankAccount.id },
        _sum: { amount: true }
      })
    ]);

    const currentBalance = 
      bankAccount.initialBalance + 
      (incomeSum._sum.amount || 0) - 
      (expenseSum._sum.amount || 0);

    return NextResponse.json({ ...bankAccount, currentBalance });
  } catch (error) {
    console.error("Erreur GET bank-account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Mettre à jour un compte
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, bank, initialBalance, color, icon, isActive, isDefault } = body;

    // Vérifier que le compte appartient à l'utilisateur
    const existing = await prisma.bankAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
    }

    // Si c'est le compte par défaut, retirer le statut des autres
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { 
          userId: session.user.id,
          id: { not: params.id }
        },
        data: { isDefault: false }
      });
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? type : existing.type,
        bank: bank !== undefined ? bank : existing.bank,
        initialBalance: initialBalance !== undefined ? initialBalance : existing.initialBalance,
        color: color !== undefined ? color : existing.color,
        icon: icon !== undefined ? icon : existing.icon,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      }
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Erreur PUT bank-account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un compte
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le compte appartient à l'utilisateur
    const existing = await prisma.bankAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            incomes: true,
            expenses: true,
            subscriptions: true,
          }
        }
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
    }

    // Vérifier s'il y a des transactions liées
    const hasTransactions = 
      existing._count.incomes > 0 || 
      existing._count.expenses > 0 || 
      existing._count.subscriptions > 0;

    if (hasTransactions) {
      // Option: Dissocier les transactions au lieu de bloquer
      await Promise.all([
        prisma.income.updateMany({
          where: { bankAccountId: params.id },
          data: { bankAccountId: null }
        }),
        prisma.expense.updateMany({
          where: { bankAccountId: params.id },
          data: { bankAccountId: null }
        }),
        prisma.subscription.updateMany({
          where: { bankAccountId: params.id },
          data: { bankAccountId: null }
        })
      ]);
    }

    await prisma.bankAccount.delete({
      where: { id: params.id }
    });

    // Si c'était le compte par défaut, en définir un autre
    if (existing.isDefault) {
      const firstAccount = await prisma.bankAccount.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' }
      });
      
      if (firstAccount) {
        await prisma.bankAccount.update({
          where: { id: firstAccount.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE bank-account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

