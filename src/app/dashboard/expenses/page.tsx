'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Calendar, Wallet, Pencil } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
  bankAccountId?: string;
  category?: {
    name: string;
    color?: string;
  };
}

interface BankAccount {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  color: string | null;
  isDefault: boolean;
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'paid',
    bankAccountId: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'paid',
    bankAccountId: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, accountsRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/bank-accounts')
      ]);
      
      if (expensesRes.ok) {
        const data = await expensesRes.json();
        setExpenses(data);
      }
      
      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        setBankAccounts(accounts);
        // Définir le compte par défaut (préférer compte courant)
        const checkingAccount = accounts.find((a: BankAccount) => a.type === 'checking' && a.isDefault);
        const defaultAccount = checkingAccount || accounts.find((a: BankAccount) => a.isDefault);
        if (defaultAccount && !formData.bankAccountId) {
          setFormData(prev => ({ ...prev, bankAccountId: defaultAccount.id }));
        }
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData.bankAccountId, toast]);

  // Charger les dépenses et les comptes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          bankAccountId: formData.bankAccountId || null,
        }),
      });

      if (response.ok) {
        const selectedAccount = bankAccounts.find(a => a.id === formData.bankAccountId);
        toast({
          title: 'Dépense ajoutée',
          description: selectedAccount 
            ? `La dépense a été débitée du compte "${selectedAccount.name}"`
            : 'La dépense a été enregistrée avec succès',
        });
        
        const defaultAccountId = formData.bankAccountId;
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          status: 'paid',
          bankAccountId: defaultAccountId,
        });
        fetchData();
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la dépense',
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
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la dépense',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({
      name: expense.name,
      amount: Number(expense.amount).toString(),
      date: expense.date.split('T')[0],
      description: expense.description || '',
      status: expense.status || 'paid',
      bankAccountId: expense.bankAccountId || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          amount: parseFloat(editFormData.amount),
          bankAccountId: editFormData.bankAccountId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('update failed');
      }

      toast({
        title: 'Dépense mise à jour',
        description: 'Les modifications ont été enregistrées.',
      });

      setEditingExpense(null);
      fetchData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la dépense',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dépenses</h1>
        <p className="text-gray-600 mt-1">Gérez vos dépenses mensuelles</p>
      </div>

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

            {/* Sélecteur de compte bancaire */}
            {bankAccounts.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Débiter depuis</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {bankAccounts.filter(a => a.type === 'checking').map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, bankAccountId: account.id })}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        formData.bankAccountId === account.id
                          ? 'border-2 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: formData.bankAccountId === account.id ? account.color || '#3B82F6' : undefined,
                        backgroundColor: formData.bankAccountId === account.id ? `${account.color || '#3B82F6'}10` : undefined,
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${account.color || '#6B7280'}20` }}
                      >
                        <Wallet className="h-4 w-4" style={{ color: account.color || '#6B7280' }} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{account.name}</p>
                        {account.bank && (
                          <p className="text-xs text-gray-500 truncate">{account.bank}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Seuls les comptes courants sont affichés pour les dépenses
                </p>
              </div>
            )}

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
            <Button type="submit" disabled={isAdding}>
              <Plus className="mr-2 h-4 w-4" />
              {isAdding ? 'Ajout en cours...' : 'Ajouter la dépense'}
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
            <p className="text-center text-gray-600">Chargement...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-600">Aucune dépense enregistrée</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => {
                const account = bankAccounts.find(a => a.id === expense.bankAccountId);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{expense.name}</h3>
                        {expense.category && (
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: expense.category.color + '20',
                              color: expense.category.color,
                            }}
                          >
                            {expense.category.name}
                          </span>
                        )}
                        {account && (
                          <span 
                            className="text-xs px-2 py-1 rounded flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${account.color || '#6B7280'}15`,
                              color: account.color || '#6B7280'
                            }}
                          >
                            <Wallet className="h-3 w-3" />
                            {account.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateShort(expense.date)}
                        </span>
                        {expense.description && <span>{expense.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(expense)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Modifier la dépense"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-bold text-red-600">-{formatCurrency(Number(expense.amount))}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la dépense</DialogTitle>
            <DialogDescription>
              Ajuste les informations puis sauvegarde les changements.
            </DialogDescription>
          </DialogHeader>

          {editingExpense && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom *</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Montant (€) *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              {bankAccounts.length > 0 && (
                <div className="space-y-2">
                  <Label>Compte associé</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {bankAccounts.filter(a => a.type === 'checking').map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, bankAccountId: account.id })}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                          editFormData.bankAccountId === account.id
                            ? 'border-2 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: editFormData.bankAccountId === account.id ? account.color || '#3B82F6' : undefined,
                          backgroundColor: editFormData.bankAccountId === account.id ? `${account.color || '#3B82F6'}10` : undefined,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${account.color || '#6B7280'}20` }}
                        >
                          <Wallet className="h-4 w-4" style={{ color: account.color || '#6B7280' }} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{account.name}</p>
                          {account.bank && (
                            <p className="text-xs text-gray-500 truncate">{account.bank}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <select
                    id="edit-status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="paid">Payée</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Optionnel"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingExpense(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Sauvegarde...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
