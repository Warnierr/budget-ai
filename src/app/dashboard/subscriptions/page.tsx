'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  billingDate: number;
  isActive: boolean;
  url?: string;
  description?: string;
  reminderDays: number;
  category?: {
    name: string;
    color?: string;
  };
}

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as 'monthly' | 'yearly',
    billingDate: '1',
    url: '',
    description: '',
    reminderDays: '3',
  });

  // Charger les abonnements
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setError(null);
      const response = await fetch('/api/subscriptions');
      
      if (response.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else {
        throw new Error('Erreur de chargement');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les abonnements',
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
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          billingDate: parseInt(formData.billingDate),
          reminderDays: parseInt(formData.reminderDays),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout');
      }

      toast({
        title: 'Succès !',
        description: 'Abonnement ajouté avec succès.',
        className: "bg-green-50 border-green-200 text-green-900",
      });

      setFormData({
        name: '',
        amount: '',
        frequency: 'monthly',
        billingDate: '1',
        url: '',
        description: '',
        reminderDays: '3',
      });
      
      fetchSubscriptions();
      router.refresh();

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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Abonnement supprimé',
          description: 'L\'abonnement a été supprimé avec succès',
        });
        fetchSubscriptions();
        router.refresh();
      } else {
        throw new Error('Erreur suppression');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'abonnement',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast({
          title: isActive ? 'Abonnement désactivé' : 'Abonnement activé',
        });
        fetchSubscriptions();
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'abonnement',
        variant: 'destructive',
      });
    }
  };

  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive);
  const inactiveSubscriptions = subscriptions.filter((sub) => !sub.isActive);

  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const amount = Number(sub.amount);
    return sum + (sub.frequency === 'monthly' ? amount : amount / 12);
  }, 0);

  const totalYearly = totalMonthly * 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abonnements</h1>
        <p className="text-gray-600 mt-1">Gérez tous vos abonnements en un seul endroit</p>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
          <AlertCircle className="h-5 w-5" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Résumé */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coût mensuel</CardTitle>
            <CardDescription>Total de vos abonnements actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalMonthly)}</div>
            <p className="text-sm text-gray-600 mt-1">{activeSubscriptions.length} abonnements actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coût annuel</CardTitle>
            <CardDescription>Projection sur 12 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalYearly)}</div>
            <p className="text-sm text-gray-600 mt-1">Économisez en annulant les inutilisés !</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Netflix, Spotify..."
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
                <Label htmlFor="frequency">Fréquence *</Label>
                <select
                  id="frequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'monthly' | 'yearly' })}
                  required
                >
                  <option value="monthly">Mensuel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingDate">Jour de prélèvement *</Label>
                <Input
                  id="billingDate"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  value={formData.billingDate}
                  onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL (optionnel)</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderDays">Rappel (jours avant)</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.reminderDays}
                  onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                />
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
            <Button type="submit" disabled={isAdding} className="w-full md:w-auto">
              {isAdding ? 'Ajout en cours...' : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter l'abonnement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des abonnements actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements actifs</CardTitle>
          <CardDescription>{activeSubscriptions.length} abonnements</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : activeSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              <p>Aucun abonnement actif.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                        {subscription.frequency === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Prélèvement le {subscription.billingDate} du mois
                      </span>
                      {subscription.url && (
                        <a
                          href={subscription.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Gérer
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(Number(subscription.amount))}</span>
                      <p className="text-xs text-gray-600">
                        {subscription.frequency === 'yearly'
                          ? `${formatCurrency(Number(subscription.amount) / 12)}/mois`
                          : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(subscription.id, subscription.isActive)}
                      >
                        Désactiver
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subscription.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abonnements inactifs */}
      {inactiveSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Abonnements désactivés</CardTitle>
            <CardDescription>{inactiveSubscriptions.length} abonnements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 opacity-75"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">{subscription.name}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{formatCurrency(Number(subscription.amount))}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(subscription.id, subscription.isActive)}
                    >
                      Réactiver
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subscription.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
