'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
  category?: {
    name: string;
    color?: string;
  };
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'paid',
  });

  // Charger les dépenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setError(null);
      const response = await fetch('/api/expenses');
      
      if (response.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        throw new Error('Erreur de chargement');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les dépenses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout');
      }

      toast({
        title: 'Succès !',
        description: 'Dépense ajoutée avec succès.',
        className: "bg-green-50 border-green-200 text-green-900",
      });

      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'paid',
      });
      
      fetchExpenses();
      router.refresh(); // Rafraîchir les Server Components (dashboard summary)

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setError(message);
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Dépense supprimée',
          description: 'La dépense a été supprimée avec succès',
        });
        fetchExpenses();
        router.refresh();
      } else {
        throw new Error('Erreur suppression');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la dépense',
        variant: 'destructive',
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dépenses</h1>
        <p className="text-gray-600 mt-1">Gérez vos dépenses mensuelles</p>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
          <AlertCircle className="h-5 w-5" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Résumé */}
      <Card>
        <CardHeader>
          <CardTitle>Total des dépenses</CardTitle>
          <CardDescription>Ce mois-ci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-sm text-gray-600 mt-1">{expenses.length} dépenses enregistrées</p>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une dépense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Restaurant, Courses..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optionnel"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={isAdding} className="w-full md:w-auto">
              {isAdding ? 'Ajout en cours...' : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter la dépense
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              <p>Aucune dépense enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{expense.name}</h3>
                      {expense.category && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: (expense.category.color || '#6b7280') + '20',
                            color: expense.category.color || '#6b7280',
                          }}
                        >
                          {expense.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateShort(expense.date)}
                      </span>
                      {expense.description && (
                         <span className="hidden sm:inline text-gray-400">• {expense.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <span className="text-lg font-bold text-red-600">-{formatCurrency(Number(expense.amount))}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
