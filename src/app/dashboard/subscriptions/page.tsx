'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
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
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      }
    } catch (error) {
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

      if (response.ok) {
        toast({
          title: 'Abonnement ajouté',
          description: 'L\'abonnement a été enregistré avec succès',
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
      } else {
        throw new Error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'abonnement',
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
            <Button type="submit" disabled={isAdding}>
              <Plus className="mr-2 h-4 w-4" />
              {isAdding ? 'Ajout en cours...' : 'Ajouter l\'abonnement'}
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
            <p className="text-center text-gray-600">Chargement...</p>
          ) : activeSubscriptions.length === 0 ? (
            <p className="text-center text-gray-600">Aucun abonnement actif</p>
          ) : (
            <div className="space-y-3">
              {activeSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{subscription.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {subscription.frequency === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(Number(subscription.amount))}</span>
                      <p className="text-xs text-gray-600">
                        {subscription.frequency === 'yearly'
                          ? `${formatCurrency(Number(subscription.amount) / 12)}/mois`
                          : ''}
                      </p>
                    </div>
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
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 opacity-60"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{subscription.name}</h3>
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
                      className="text-red-600"
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

