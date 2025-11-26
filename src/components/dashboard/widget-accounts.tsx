"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BankAccount {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  currentBalance: number;
  color: string | null;
  isDefault: boolean;
}

interface WidgetAccountsProps {
  accounts: BankAccount[];
}

export function WidgetAccounts({ accounts }: WidgetAccountsProps) {
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  if (accounts.length === 0) {
    return (
      <Card className="shadow-sm border-slate-100 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Comptes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Wallet className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-3">Aucun compte configuré</p>
          <Link href="/dashboard/accounts">
            <Button size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Ajouter
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-100 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Comptes
          </CardTitle>
          <Link 
            href="/dashboard/accounts" 
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            Gérer <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Patrimoine total</p>
          <p className={`text-xl font-bold ${totalBalance >= 0 ? "text-gray-900" : "text-red-600"}`}>
            {formatCurrency(totalBalance)}
          </p>
        </div>

        {/* Liste des comptes */}
        <div className="space-y-2">
          {accounts.slice(0, 4).map((account) => (
            <div 
              key={account.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${account.color || "#6B7280"}20` }}
                >
                  <Wallet 
                    className="h-4 w-4" 
                    style={{ color: account.color || "#6B7280" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.name}</p>
                  {account.bank && (
                    <p className="text-xs text-gray-500">{account.bank}</p>
                  )}
                </div>
              </div>
              <p className={`text-sm font-bold ${
                account.currentBalance >= 0 ? "text-gray-900" : "text-red-600"
              }`}>
                {formatCurrency(account.currentBalance)}
              </p>
            </div>
          ))}
        </div>

        {accounts.length > 4 && (
          <Link 
            href="/dashboard/accounts"
            className="block text-center text-xs text-gray-500 hover:text-blue-600 pt-2"
          >
            Voir les {accounts.length - 4} autres comptes
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

