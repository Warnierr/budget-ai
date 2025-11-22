'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';

interface Income {
  id: string;
  name: string;
  amount: number;
  date: string;
  frequency: string;
  isRecurring: boolean;
  description?: string;
}

export default function IncomesPage() {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'monthly',
    isRecurring: false,
    description: '',
  });

  // Charger les revenus
  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/incomes');
      if (response.ok) {
        const data = await response.json();
        setIncomes(data);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les revenus',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Revenu ajouté',
          description: 'Le revenu a été enregistré avec succès',
        });
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          frequency: 'monthly',
          isRecurring: false,
          description: '',
        });
        fetchIncomes();
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le revenu',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Revenu supprimé',
          description: 'Le revenu a été supprimé avec succès',
        });
        fetchIncomes();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le revenu',
        variant: 'destructive',
      });
    }
  };

  const totalIncomes = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

  const frequencyLabels: Record<string, string> = {
    monthly: 'Mensuel',
    once: 'Ponctuel',
    weekly: 'Hebdomadaire',
    yearly: 'Annuel',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenus</h1>
        <p className="text-gray-600 mt-1">Gérez vos entrées d'argent</p>
      </div>

      {/* Résumé */}
      <Card>
        <CardHeader>
          <CardTitle>Total des revenus</CardTitle>
          <CardDescription>Ce mois-ci</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(totalIncomes)}</div>
          <p className="text-sm text-gray-600 mt-1">{incomes.length} revenus enregistrés</p>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un revenu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Salaire, Freelance..."
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
                <Label htmlFor="frequency">Fréquence *</Label>
                <select
                  id="frequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="monthly">Mensuel</option>
                  <option value="once">Ponctuel</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">
                Revenu récurrent (se répète automatiquement)
              </Label>
            </div>
            <Button type="submit" disabled={isAdding}>
              <Plus className="mr-2 h-4 w-4" />
              {isAdding ? 'Ajout en cours...' : 'Ajouter le revenu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-600">Chargement...</p>
          ) : incomes.length === 0 ? (
            <p className="text-center text-gray-600">Aucun revenu enregistré</p>
          ) : (
            <div className="space-y-2">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{income.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        {frequencyLabels[income.frequency]}
                      </span>
                      {income.isRecurring && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Récurrent</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateShort(income.date)}
                      </span>
                      {income.description && <span>{income.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-green-600">+{formatCurrency(Number(income.amount))}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(income.id)}
                      className="text-red-600 hover:text-red-700"
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

