'use client';

import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  parseSkipped: number;
}

interface ImportResultProps {
  stats: ImportStats;
  bankSource: string;
  batchId: string;
  parseErrors?: string[];
  onReset: () => void;
}

const BANK_NAMES: Record<string, string> = {
  revolut: 'Revolut',
  sg: 'Societe Generale',
  bnp: 'BNP Paribas',
  boursorama: 'Boursorama',
  generic: 'Format generique',
};

export function ImportResult({ stats, bankSource, batchId, parseErrors, onReset }: ImportResultProps) {
  const hasErrors = stats.errors > 0 || (parseErrors && parseErrors.length > 0);
  const hasSkipped = stats.skipped > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {stats.imported > 0 ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Resultat de l&apos;import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format detecte */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Format detecte : <span className="font-medium">{BANK_NAMES[bankSource] || bankSource}</span>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.imported}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Importees</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.skipped}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Doublons</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.errors}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Erreurs</div>
          </div>
        </div>
        
        {/* Avertissements */}
        {hasSkipped && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-700 dark:text-yellow-300">
              {stats.skipped} transaction(s) ignoree(s) car deja presentes dans votre compte.
            </div>
          </div>
        )}
        
        {/* Erreurs de parsing */}
        {parseErrors && parseErrors.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              <XCircle className="h-4 w-4" />
              Erreurs de parsing
            </div>
            <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
              {parseErrors.slice(0, 5).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
              {parseErrors.length > 5 && (
                <li>... et {parseErrors.length - 5} autres erreurs</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {stats.imported > 0 && (
            <Link href={`/dashboard/import/review?batch=${batchId}`} className="flex-1">
              <Button className="w-full">
                Valider les transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Button variant="outline" onClick={onReset} className="flex-1">
            Importer un autre fichier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
