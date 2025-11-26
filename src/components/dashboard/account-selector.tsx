"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { 
  Wallet, 
  ChevronDown, 
  Building2, 
  PiggyBank, 
  TrendingUp,
  Coins,
  Check,
  LayoutGrid
} from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  currentBalance: number;
  color: string | null;
  isDefault: boolean;
}

interface AccountSelectorProps {
  accounts: BankAccount[];
  selectedAccountId: string | null; // null = tous les comptes
  onSelectAccount: (accountId: string | null) => void;
}

const TYPE_ICONS: Record<string, typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  investment: TrendingUp,
  crypto: Coins,
};

const TYPE_LABELS: Record<string, string> = {
  checking: "Compte courant",
  savings: "Épargne",
  investment: "Investissement",
  crypto: "Crypto",
};

export function AccountSelector({ accounts, selectedAccountId, onSelectAccount }: AccountSelectorProps) {
  const selectedAccount = selectedAccountId 
    ? accounts.find(a => a.id === selectedAccountId) 
    : null;

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const getIcon = (type: string) => TYPE_ICONS[type] || Wallet;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
          <div className="flex items-center gap-2">
            {selectedAccount ? (
              <>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${selectedAccount.color || "#6B7280"}20` }}
                >
                  {(() => {
                    const Icon = getIcon(selectedAccount.type);
                    return <Icon className="h-3 w-3" style={{ color: selectedAccount.color || "#6B7280" }} />;
                  })()}
                </div>
                <span className="font-medium">{selectedAccount.name}</span>
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Tous les comptes</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="text-xs text-gray-500">
          Sélectionner un compte
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Option "Tous les comptes" */}
        <DropdownMenuItem 
          onClick={() => onSelectAccount(null)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">Tous les comptes</p>
              <p className="text-xs text-gray-500">Vue consolidée</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{formatCurrency(totalBalance)}</span>
            {selectedAccountId === null && <Check className="h-4 w-4 text-blue-600" />}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Grouper par type */}
        {Object.entries(TYPE_LABELS).map(([type, label]) => {
          const typeAccounts = accounts.filter(a => a.type === type);
          if (typeAccounts.length === 0) return null;

          return (
            <div key={type}>
              <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wide mt-2">
                {label}
              </DropdownMenuLabel>
              {typeAccounts.map((account) => {
                const Icon = getIcon(account.type);
                return (
                  <DropdownMenuItem 
                    key={account.id}
                    onClick={() => onSelectAccount(account.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${account.color || "#6B7280"}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: account.color || "#6B7280" }} />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        {account.bank && (
                          <p className="text-xs text-gray-500">{account.bank}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${account.currentBalance >= 0 ? "" : "text-red-600"}`}>
                        {formatCurrency(account.currentBalance)}
                      </span>
                      {selectedAccountId === account.id && <Check className="h-4 w-4 text-blue-600" />}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Composant pour afficher les règles/conseils selon le type de compte
export function AccountTypeInfo({ type }: { type: string | null }) {
  if (!type) return null;

  const infos: Record<string, { title: string; tips: string[]; color: string }> = {
    checking: {
      title: "Compte Courant",
      tips: [
        "Gardez 1-2 mois de dépenses en réserve",
        "Surveillez les frais bancaires",
        "Idéal pour les dépenses quotidiennes"
      ],
      color: "blue"
    },
    savings: {
      title: "Épargne",
      tips: [
        "Objectif: 3-6 mois de dépenses en fonds d'urgence",
        "Évitez les retraits fréquents",
        "Comparez les taux d'intérêt"
      ],
      color: "green"
    },
    investment: {
      title: "Investissement",
      tips: [
        "Investissez sur le long terme (5+ ans)",
        "Diversifiez vos placements",
        "Ne touchez pas en cas de baisse"
      ],
      color: "purple"
    },
    crypto: {
      title: "Crypto-monnaies",
      tips: [
        "N'investissez que ce que vous pouvez perdre",
        "Gardez vos clés privées en sécurité",
        "Attention à la volatilité"
      ],
      color: "orange"
    }
  };

  const info = infos[type];
  if (!info) return null;

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    green: "bg-green-50 border-green-100 text-green-800",
    purple: "bg-purple-50 border-purple-100 text-purple-800",
    orange: "bg-orange-50 border-orange-100 text-orange-800",
  };

  return (
    <div className={`rounded-lg p-3 border ${colorClasses[info.color]}`}>
      <p className="font-medium text-sm mb-2">{info.title}</p>
      <ul className="text-xs space-y-1 opacity-80">
        {info.tips.map((tip, i) => (
          <li key={i}>• {tip}</li>
        ))}
      </ul>
    </div>
  );
}

