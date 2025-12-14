/**
 * API Import CSV
 * POST /api/import/csv
 * 
 * Upload et parse un fichier CSV bancaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCSVFile, detectBankFormat } from '@/lib/parsers';

// Limite de taille : 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Verifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Recuperer le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bankAccountId = formData.get('bankAccountId') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }
    
    if (!bankAccountId) {
      return NextResponse.json(
        { error: 'Compte bancaire non specifie' },
        { status: 400 }
      );
    }
    
    // Verifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5MB)' },
        { status: 400 }
      );
    }
    
    // Verifier le type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Format de fichier non supporte. Utilisez un fichier CSV.' },
        { status: 400 }
      );
    }
    
    // Verifier que le compte appartient a l'utilisateur
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        userId: userId,
      },
    });
    
    if (!bankAccount) {
      return NextResponse.json(
        { error: 'Compte bancaire non trouve' },
        { status: 404 }
      );
    }
    
    // Lire le contenu du fichier
    const content = await file.text();
    
    // Parser le CSV
    const parseResult = parseCSVFile(content);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Echec du parsing', 
          details: parseResult.errors,
          bankSource: parseResult.bankSource,
        },
        { status: 400 }
      );
    }
    
    // Creer un batch d'import
    const importBatch = await prisma.importBatch.create({
      data: {
        userId,
        bankAccountId,
        bankSource: parseResult.bankSource,
        fileName: file.name,
        totalRows: parseResult.transactions.length + parseResult.skippedLines,
        status: 'processing',
      },
    });
    
    // Inserer les transactions (avec gestion des doublons)
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const transaction of parseResult.transactions) {
      try {
        // Tenter l'insertion (la contrainte unique gerera les doublons)
        await prisma.importedTransaction.create({
          data: {
            userId,
            bankAccountId,
            rawLabel: transaction.label,
            rawAmount: transaction.amount,
            rawDate: transaction.date,
            importBatch: importBatch.id,
            bankSource: parseResult.bankSource,
            status: 'pending',
          },
        });
        importedCount++;
      } catch (error: unknown) {
        // Verifier si c'est une erreur de contrainte unique (doublon)
        if (
          error instanceof Error && 
          'code' in error && 
          (error as { code: string }).code === 'P2002'
        ) {
          skippedCount++;
        } else {
          errorCount++;
          errors.push(`Transaction ${transaction.label}: ${error instanceof Error ? error.message : 'Erreur'}`);
        }
      }
    }
    
    // Mettre a jour le batch
    await prisma.importBatch.update({
      where: { id: importBatch.id },
      data: {
        importedRows: importedCount,
        skippedRows: skippedCount + parseResult.skippedLines,
        errorRows: errorCount,
        status: errorCount > 0 && importedCount === 0 ? 'failed' : 'completed',
        errorMessage: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
        completedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      batchId: importBatch.id,
      bankSource: parseResult.bankSource,
      stats: {
        total: parseResult.transactions.length,
        imported: importedCount,
        skipped: skippedCount,
        errors: errorCount,
        parseSkipped: parseResult.skippedLines,
      },
      parseErrors: parseResult.errors,
    });
    
  } catch (error) {
    console.error('Erreur import CSV:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'import' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/import/csv
 * 
 * Retourne l'historique des imports
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      );
    }
    
    const batches = await prisma.importBatch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    
    return NextResponse.json({ batches });
    
  } catch (error) {
    console.error('Erreur GET imports:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
