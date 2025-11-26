import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET - Récupérer tous les comptes bancaires
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ],
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

    // Calculer le solde actuel de chaque compte
    const accountsWithBalance = await Promise.all(
      bankAccounts.map(async (account) => {
        const [incomeSum, expenseSum] = await Promise.all([
          prisma.income.aggregate({
            where: { bankAccountId: account.id },
            _sum: { amount: true }
          }),
          prisma.expense.aggregate({
            where: { bankAccountId: account.id },
            _sum: { amount: true }
          })
        ]);

        const currentBalance = 
          account.initialBalance + 
          (incomeSum._sum.amount || 0) - 
          (expenseSum._sum.amount || 0);

        return {
          ...account,
          currentBalance,
        };
      })
    );

    return NextResponse.json(accountsWithBalance);
  } catch (error) {
    console.error("Erreur GET bank-accounts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau compte bancaire
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, bank, initialBalance, color, icon, isDefault } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    // Si c'est le compte par défaut, retirer le statut des autres
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    // Vérifier si c'est le premier compte (le rendre par défaut)
    const existingAccounts = await prisma.bankAccount.count({
      where: { userId: session.user.id }
    });

    const bankAccount = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        name,
        type: type || "checking",
        bank: bank || null,
        initialBalance: initialBalance || 0,
        color: color || null,
        icon: icon || null,
        isDefault: isDefault || existingAccounts === 0, // Premier compte = défaut
      }
    });

    return NextResponse.json(bankAccount, { status: 201 });
  } catch (error) {
    console.error("Erreur POST bank-accounts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

