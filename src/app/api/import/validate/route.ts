import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { learnFromCorrection } from '@/lib/classifier';

// POST /api/import/validate
// Body: { transactionIds: string[], categories: Record<string, string> }
export async function POST(request: NextRequest) {
  try {
    // Verifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionIds, categories } = body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: 'Aucune transaction selectionnee' }, { status: 400 });
    }

    // Recuperer les transactions a valider
    const transactions = await prisma.importedTransaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: session.user.id,
        status: 'pending',
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: 'Aucune transaction valide trouvee' }, { status: 404 });
    }

    let validated = 0;
    const errors: string[] = [];

    // Convertir chaque transaction en depense ou revenu
    for (const transaction of transactions) {
      try {
        const categoryName = categories?.[transaction.id] || transaction.category || 'Autre';
        const userCorrected = categories?.[transaction.id] && categories[transaction.id] !== transaction.category;

        // Apprentissage : si l'utilisateur a corrige la categorie, on cree une regle
        if (userCorrected) {
          await learnFromCorrection(
            session.user.id,
            transaction.rawLabel,
            categoryName,
            transaction.isRecurring,
            transaction.recurringType as 'subscription' | 'income' | null
          );
        }

        if (transaction.rawAmount >= 0) {
          // C'est un revenu
          const income = await prisma.income.create({
            data: {
              userId: session.user.id,
              bankAccountId: transaction.bankAccountId,
              name: transaction.rawLabel,
              description: transaction.rawLabel,
              amount: transaction.rawAmount,
              date: transaction.rawDate,
              isRecurring: transaction.isRecurring,
              frequency: transaction.isRecurring ? 'monthly' : 'once',
            },
          });

          // Marquer comme converti
          await prisma.importedTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'converted',
              convertedIncomeId: income.id,
              category: categoryName,
            },
          });
        } else {
          // C'est une depense (montant negatif -> on prend la valeur absolue)

          // Trouver ou creer la categorie pour l'utilisateur
          let category = await prisma.category.findFirst({
            where: {
              name: categoryName,
              OR: [
                { userId: session.user.id },
                { isDefault: true }
              ]
            }
          });

          if (!category) {
            category = await prisma.category.create({
              data: {
                name: categoryName,
                userId: session.user.id,
                color: '#6366f1',
                icon: 'Tag',
              }
            });
          }

          // Créer l'abonnement si c'est détecté comme tel
          if (transaction.recurringType === 'subscription') {
            // Vérifier si un abonnement avec le même nom existe déjà
            const existingSubscription = await prisma.subscription.findFirst({
              where: {
                userId: session.user.id,
                name: transaction.rawLabel,
                isActive: true,
              }
            });

            if (!existingSubscription) {
              await prisma.subscription.create({
                data: {
                  userId: session.user.id,
                  bankAccountId: transaction.bankAccountId,
                  name: transaction.rawLabel,
                  amount: Math.abs(transaction.rawAmount),
                  frequency: 'monthly', // Par défaut
                  billingDate: transaction.rawDate.getDate(),
                  categoryId: category.id,
                  isActive: true,
                }
              });
            }
          }

          const expense = await prisma.expense.create({
            data: {
              userId: session.user.id,
              bankAccountId: transaction.bankAccountId,
              name: transaction.rawLabel,
              description: transaction.rawLabel,
              amount: Math.abs(transaction.rawAmount),
              categoryId: category.id,
              date: transaction.rawDate,
              status: 'paid',
            },
          });

          // Marquer comme converti
          await prisma.importedTransaction.update({
            where: { id: transaction.id },
            data: {
              status: 'converted',
              convertedExpenseId: expense.id,
              category: categoryName,
            },
          });
        }

        validated++;
      } catch (err) {
        console.error(`Erreur conversion transaction ${transaction.id}:`, err);
        errors.push(`Transaction ${transaction.rawLabel}: erreur de conversion`);
      }
    }

    return NextResponse.json({
      success: true,
      validated,
      total: transactions.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Erreur validation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
