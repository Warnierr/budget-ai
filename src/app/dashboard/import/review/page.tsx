'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Check,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ImportedTransaction {
  id: string;
  rawLabel: string;
  rawAmount: number;
  rawDate: string;
  category: string | null;
  isRecurring: boolean;
  recurringType: string | null;
  status: string;
  bankSource: string | null;
}

interface BatchInfo {
  id: string;
  fileName: string;
  bankSource: string | null;
  totalRows: number;
  importedRows: number;
  createdAt: string;
}

const CATEGORIES = [
  'Alimentation',
  'Transport',
  'Logement',
  'Loisirs',
  'Sante',
  'Shopping',
  'Abonnements',
  'Restaurants',
  'Voyage',
  'Salaire',
  'Aides',
  'Banque',
  'Retrait',
  'Autre',
];

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batch');
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Charger les transactions du batch
  const fetchTransactions = useCallback(async () => {
    if (!batchId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/import/transactions?batch=${batchId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setBatchInfo(data.batch || null);
        // Selectionner toutes les transactions par defaut
        setSelectedIds(new Set(data.transactions?.map((t: ImportedTransaction) => t.id) || []));
      } else {
        const error = await response.json();
        toast({
          title: 'Erreur',
          description: error.error || 'Impossible de charger les transactions',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [batchId, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Selectionner tout / Deselectionner tout
  const toggleAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
    }
  };

  // Modifier la categorie d'une transaction
  const updateCategory = async (id: string, category: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, category } : t)
    );
  };

  // Valider les transactions selectionnees
  const validateSelected = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'Aucune selection',
        description: 'Selectionnez au moins une transaction a valider',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: Array.from(selectedIds),
          categories: transactions
            .filter(t => selectedIds.has(t.id))
            .reduce((acc, t) => ({ ...acc, [t.id]: t.category }), {}),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Transactions validees !',
          description: `${data.validated} transaction(s) converties en operations`,
        });
        // Retirer les transactions validees
        setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)));
        setSelectedIds(new Set());
      } else {
        const error = await response.json();
        toast({
          title: 'Erreur',
          description: error.error || 'Erreur lors de la validation',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Erreur validation:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Rejeter les transactions selectionnees
  const rejectSelected = async () => {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/import/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: Array.from(selectedIds),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Transactions rejetees',
          description: `${data.rejected} transaction(s) supprimees`,
        });
        // Retirer les transactions rejetees
        setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)));
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Erreur rejet:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (!batchId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-600 dark:text-gray-400">Aucun batch specifie</p>
        <Link href="/dashboard/import">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour a l&apos;import
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-600 dark:text-gray-400">Chargement des transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-gray-600 dark:text-gray-400">Toutes les transactions ont ete traitees !</p>
        <Link href="/dashboard/import">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Importer d&apos;autres fichiers
          </Button>
        </Link>
      </div>
    );
  }

  // Stats
  const totalAmount = transactions.reduce((sum, t) => sum + t.rawAmount, 0);
  const incomeCount = transactions.filter(t => t.rawAmount >= 0).length;
  const expenseCount = transactions.filter(t => t.rawAmount < 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/dashboard/import" className="hover:text-gray-700">
              Import CSV
            </Link>
            <span>/</span>
            <span>Validation</span>
          </div>
          <h1 className="text-3xl font-bold">Valider les transactions</h1>
          {batchInfo && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fichier : {batchInfo.fileName} • {transactions.length} transaction(s) a valider
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <div className="text-xs text-gray-500">A valider</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{incomeCount}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Revenus
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{expenseCount}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Depenses
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className={`text-2xl font-bold ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalAmount)}
            </div>
            <div className="text-xs text-gray-500">Solde net</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedIds.size === transactions.length ? 'Tout deselectionner' : 'Tout selectionner'}
              </Button>
              <span className="text-sm text-gray-500">
                {selectedIds.size} selectionnee(s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={rejectSelected}
                disabled={selectedIds.size === 0 || isProcessing}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="mr-1 h-4 w-4" />
                Rejeter
              </Button>
              <Button
                size="sm"
                onClick={validateSelected}
                disabled={selectedIds.size === 0 || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1 h-4 w-4" />
                )}
                Valider ({selectedIds.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Transactions importees
          </CardTitle>
          <CardDescription>
            Verifiez et ajustez les categories avant de valider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${selectedIds.has(transaction.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-transparent'
                  }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(transaction.id)}
                  onChange={() => toggleSelection(transaction.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />

                {/* Date */}
                <div className="w-24 text-sm text-gray-500 flex-shrink-0">
                  {formatDate(transaction.rawDate)}
                </div>

                {/* Type icon */}
                <div className="flex-shrink-0">
                  {transaction.rawAmount >= 0 ? (
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {transaction.rawLabel}
                  </div>
                  {transaction.isRecurring && (
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <RefreshCw className="h-3 w-3" />
                      {transaction.recurringType === 'subscription' ? 'Abonnement detecte' : 'Revenu recurrent'}
                    </div>
                  )}
                </div>

                {/* Categorie */}
                <select
                  value={transaction.category || ''}
                  onChange={(e) => updateCategory(transaction.id, e.target.value)}
                  className="text-sm px-2 py-1 border rounded bg-white dark:bg-gray-950 dark:border-gray-700"
                >
                  <option value="">Categorie...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Montant */}
                <div className={`w-28 text-right font-medium flex-shrink-0 ${transaction.rawAmount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {formatAmount(transaction.rawAmount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
