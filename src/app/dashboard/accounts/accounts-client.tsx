"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  Star,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  initialBalance: number;
  currentBalance: number;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

interface AccountsClientProps {
  initialAccounts: BankAccount[];
}

const BANK_TYPES = [
  { value: "checking", label: "Compte courant", icon: Wallet },
  { value: "savings", label: "Épargne", icon: PiggyBank },
  { value: "investment", label: "Investissement", icon: Building2 },
  { value: "crypto", label: "Crypto", icon: CreditCard },
];

const BANK_PRESETS = [
  { name: "Société Générale", color: "#E4002B" },
  { name: "BNP Paribas", color: "#009A44" },
  { name: "Crédit Agricole", color: "#006F4E" },
  { name: "Revolut", color: "#0666EB" },
  { name: "N26", color: "#36A18B" },
  { name: "Boursorama", color: "#FF6600" },
  { name: "Fortuneo", color: "#E30613" },
  { name: "Hello bank!", color: "#00A3E0" },
  { name: "LCL", color: "#002855" },
  { name: "Caisse d'Épargne", color: "#E4002B" },
  { name: "Autre", color: "#6B7280" },
];

const ACCOUNT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#6366F1", // indigo
];

export function AccountsClient({ initialAccounts }: AccountsClientProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    bank: "",
    initialBalance: 0,
    color: ACCOUNT_COLORS[0],
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "checking",
      bank: "",
      initialBalance: 0,
      color: ACCOUNT_COLORS[0],
      isDefault: false,
    });
    setEditingAccount(null);
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      bank: account.bank || "",
      initialBalance: account.initialBalance,
      color: account.color || ACCOUNT_COLORS[0],
      isDefault: account.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingAccount 
        ? `/api/bank-accounts/${editingAccount.id}`
        : "/api/bank-accounts";
      
      const method = editingAccount ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast({
        title: editingAccount ? "Compte modifié" : "Compte créé",
        description: `Le compte "${formData.name}" a été ${editingAccount ? "modifié" : "créé"} avec succès.`,
      });

      setIsDialogOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le compte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (account: BankAccount) => {
    if (!confirm(`Supprimer le compte "${account.name}" ?`)) return;

    try {
      const response = await fetch(`/api/bank-accounts/${account.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast({
        title: "Compte supprimé",
        description: `Le compte "${account.name}" a été supprimé.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (account: BankAccount) => {
    try {
      const response = await fetch(`/api/bank-accounts/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error("Erreur");
      }

      toast({
        title: "Compte par défaut",
        description: `"${account.name}" est maintenant le compte par défaut.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le compte par défaut.",
        variant: "destructive",
      });
    }
  };

  // Calcul du solde total
  const totalBalance = accounts
    .filter(a => a.isActive)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const getTypeIcon = (type: string) => {
    const typeConfig = BANK_TYPES.find(t => t.value === type);
    return typeConfig?.icon || Wallet;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Comptes bancaires</h1>
          <p className="text-gray-500">Gérez vos différents comptes et suivez leurs soldes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un compte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Modifier le compte" : "Nouveau compte bancaire"}
              </DialogTitle>
              <DialogDescription>
                {editingAccount 
                  ? "Modifiez les informations de votre compte"
                  : "Ajoutez un nouveau compte pour suivre vos finances"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom du compte */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom du compte</Label>
                <Input
                  id="name"
                  placeholder="Ex: Compte principal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Type de compte */}
              <div className="space-y-2">
                <Label>Type de compte</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BANK_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                          formData.type === type.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Banque */}
              <div className="space-y-2">
                <Label>Banque</Label>
                <div className="flex flex-wrap gap-2">
                  {BANK_PRESETS.slice(0, 6).map((bank) => (
                    <button
                      key={bank.name}
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        bank: bank.name,
                        color: bank.color 
                      })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.bank === bank.name
                          ? "ring-2 ring-offset-1"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      style={{ 
                        backgroundColor: `${bank.color}20`,
                        color: bank.color,
                        borderColor: bank.color,
                      }}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Ou saisissez le nom de votre banque"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                />
              </div>

              {/* Solde initial */}
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Solde actuel</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">
                  Entrez le solde actuel de ce compte pour commencer le suivi
                </p>
              </div>

              {/* Couleur */}
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2">
                  {ACCOUNT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Compte par défaut */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                  Définir comme compte par défaut
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Sauvegarde..." : editingAccount ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Solde total */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-none">
        <CardHeader>
          <CardDescription className="text-slate-300">Patrimoine total</CardDescription>
          <CardTitle className="text-4xl font-bold tracking-tight">
            {formatCurrency(totalBalance)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            {accounts.filter(a => a.isActive).length} compte{accounts.filter(a => a.isActive).length > 1 ? 's' : ''} actif{accounts.filter(a => a.isActive).length > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Liste des comptes */}
      {accounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun compte</h3>
            <p className="text-gray-500 text-center mb-4">
              Ajoutez votre premier compte bancaire pour commencer le suivi
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un compte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const TypeIcon = getTypeIcon(account.type);
            return (
              <Card 
                key={account.id} 
                className={`relative overflow-hidden transition-all hover:shadow-md ${
                  !account.isActive ? "opacity-60" : ""
                }`}
              >
                {/* Barre de couleur */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: account.color || "#6B7280" }}
                />
                
                {/* Badge défaut */}
                {account.isDefault && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      Défaut
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <TypeIcon 
                        className="h-5 w-5" 
                        style={{ color: account.color || "#6B7280" }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{account.name}</CardTitle>
                      {account.bank && (
                        <CardDescription className="text-xs">{account.bank}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className={`text-2xl font-bold ${
                    account.currentBalance >= 0 ? "text-gray-900" : "text-red-600"
                  }`}>
                    {formatCurrency(account.currentBalance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {BANK_TYPES.find(t => t.value === account.type)?.label || "Compte"}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(account)}
                      className="flex-1 gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Modifier
                    </Button>
                    {!account.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(account)}
                        className="gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Défaut
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

