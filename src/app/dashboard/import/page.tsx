'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CSVDropzone } from '@/components/import/csv-dropzone';
import { ImportResult } from '@/components/import/import-result';

interface BankAccount {
  id: string;
  name: string;
  bank: string | null;
}

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  parseSkipped: number;
}

interface ImportResponse {
  success: boolean;
  batchId: string;
  bankSource: string;
  stats: ImportStats;
  parseErrors?: string[];
  error?: string;
  details?: string[];
}

export default function ImportPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  
  // Charger les comptes bancaires
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/bank-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
        if (data.length > 0 && !selectedAccountId) {
          // Selectionner le premier compte par defaut
          const defaultAccount = data.find((a: BankAccount) => a.bank) || data[0];
          setSelectedAccountId(defaultAccount.id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement comptes:', err);
    }
  }, [selectedAccountId]);
  
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);
  
  const handleFileSelect = async (file: File) => {
    if (!selectedAccountId) {
      setError('Veuillez selectionner un compte bancaire');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankAccountId', selectedAccountId);
      
      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      });
      
      const data: ImportResponse = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'import');
        if (data.details && data.details.length > 0) {
          toast({
            title: 'Erreur de parsing',
            description: data.details.slice(0, 3).join('\n'),
            variant: 'destructive',
          });
        }
        return;
      }
      
      setImportResult(data);
      
      if (data.stats.imported > 0) {
        toast({
          title: 'Import reussi !',
          description: `${data.stats.imported} transaction(s) importee(s)`,
        });
      }
      
    } catch (err) {
      console.error('Erreur import:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setImportResult(null);
    setError(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Import CSV</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Importez vos releves bancaires pour alimenter automatiquement votre budget
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Zone principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selection du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compte de destination</CardTitle>
              <CardDescription>
                Les transactions seront importees dans ce compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="account">Compte bancaire</Label>
                <select
                  id="account"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-950 dark:border-gray-800"
                  disabled={isLoading}
                >
                  <option value="">Selectionnez un compte</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} {account.bank ? `(${account.bank})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
          
          {/* Dropzone ou Resultat */}
          {importResult ? (
            <ImportResult
              stats={importResult.stats}
              bankSource={importResult.bankSource}
              batchId={importResult.batchId}
              parseErrors={importResult.parseErrors}
              onReset={handleReset}
            />
          ) : (
            <CSVDropzone
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
        
        {/* Aide */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Comment exporter votre CSV ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Revolut</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  App &gt; Profil &gt; Releves &gt; Exporter CSV
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Societe Generale</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Espace client &gt; Comptes &gt; Telecharger &gt; CSV
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">BNP Paribas</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Mes comptes &gt; Historique &gt; Exporter
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Boursorama</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Comptes &gt; Operations &gt; Exporter
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Formats supportes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              <ul className="space-y-1">
                <li>• Revolut (export standard)</li>
                <li>• Societe Generale</li>
                <li>• BNP Paribas</li>
                <li>• Boursorama</li>
                <li>• Format generique (CSV avec date, montant, libelle)</li>
              </ul>
              <p className="mt-3 text-xs">
                Taille max : 5 Mo
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
