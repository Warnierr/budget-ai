import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/import/reject
// Body: { transactionIds: string[] }
export async function POST(request: NextRequest) {
  try {
    // Verifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }
    
    const body = await request.json();
    const { transactionIds } = body;
    
    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: 'Aucune transaction selectionnee' }, { status: 400 });
    }
    
    // Marquer les transactions comme rejetees
    const result = await prisma.importedTransaction.updateMany({
      where: {
        id: { in: transactionIds },
        userId: session.user.id,
        status: 'pending',
      },
      data: {
        status: 'rejected',
      },
    });
    
    return NextResponse.json({
      success: true,
      rejected: result.count,
    });
    
  } catch (error) {
    console.error('Erreur rejet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
