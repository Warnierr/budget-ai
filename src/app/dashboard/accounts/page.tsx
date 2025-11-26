import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountsClient } from "./accounts-client";

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Récupérer les comptes avec leurs soldes calculés
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' }
    ],
  });

  // Calculer le solde de chaque compte
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
        id: account.id,
        name: account.name,
        type: account.type,
        bank: account.bank,
        initialBalance: account.initialBalance,
        currentBalance,
        color: account.color,
        icon: account.icon,
        isActive: account.isActive,
        isDefault: account.isDefault,
        createdAt: account.createdAt.toISOString(),
      };
    })
  );

  return <AccountsClient initialAccounts={accountsWithBalance} />;
}

