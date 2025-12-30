import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/import/transactions?batch=xxx
export async function GET(request: NextRequest) {
  try {
    // Verifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');
    
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID requis' }, { status: 400 });
    }
    
    // Recuperer le batch
    const batch = await prisma.importBatch.findFirst({
      where: {
        id: batchId,
        userId: session.user.id,
      },
    });
    
    if (!batch) {
      return NextResponse.json({ error: 'Batch non trouve' }, { status: 404 });
    }
    
    // Recuperer les transactions en attente (pending)
    const transactions = await prisma.importedTransaction.findMany({
      where: {
        importBatch: batchId,
        userId: session.user.id,
        status: 'pending',
      },
      orderBy: {
        rawDate: 'desc',
      },
    });
    
    return NextResponse.json({
      batch: {
        id: batch.id,
        fileName: batch.fileName,
        bankSource: batch.bankSource,
        totalRows: batch.totalRows,
        importedRows: batch.importedRows,
        createdAt: batch.createdAt,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        rawLabel: t.rawLabel,
        rawAmount: t.rawAmount,
        rawDate: t.rawDate.toISOString(),
        category: t.category,
        isRecurring: t.isRecurring,
        recurringType: t.recurringType,
        status: t.status,
        bankSource: t.bankSource,
      })),
    });
    
  } catch (error) {
    console.error('Erreur GET transactions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
