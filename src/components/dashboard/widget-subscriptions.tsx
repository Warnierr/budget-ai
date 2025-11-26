"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, AlertTriangle, ArrowRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  billingDate: number;
  isActive: boolean;
}

interface WidgetSubscriptionsProps {
  subscriptions: Subscription[];
}

export function WidgetSubscriptions({ subscriptions }: WidgetSubscriptionsProps) {
  const today = new Date().getDate();
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const inactiveCount = subscriptions.filter(s => !s.isActive).length;
  
  // Coût mensuel total
  const monthlyCost = activeSubscriptions.reduce((sum, s) => {
    return sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);
  
  // Coût annuel total
  const yearlyCost = activeSubscriptions.reduce((sum, s) => {
    return sum + (s.frequency === 'yearly' ? s.amount : s.amount * 12);
  }, 0);

  // Prochains prélèvements (dans les 7 jours)
  const upcomingSubscriptions = activeSubscriptions
    .filter(s => {
      const daysUntil = s.billingDate >= today 
        ? s.billingDate - today 
        : (30 - today) + s.billingDate;
      return daysUntil <= 7;
    })
    .sort((a, b) => {
      const daysA = a.billingDate >= today ? a.billingDate - today : (30 - today) + a.billingDate;
      const daysB = b.billingDate >= today ? b.billingDate - today : (30 - today) + b.billingDate;
      return daysA - daysB;
    })
    .slice(0, 4);

  const getDaysUntil = (billingDate: number) => {
    if (billingDate === today) return "Aujourd'hui";
    if (billingDate === today + 1) return "Demain";
    const days = billingDate >= today ? billingDate - today : (30 - today) + billingDate;
    return `Dans ${days}j`;
  };

  return (
    <Card className="shadow-sm border-slate-100 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            Abonnements
          </CardTitle>
          <Link 
            href="/dashboard/subscriptions" 
            className="text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1"
          >
            Gérer <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Résumé des coûts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600 mb-1">Par mois</p>
            <p className="text-lg font-bold text-orange-900">{formatCurrency(monthlyCost)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Par an</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(yearlyCost)}</p>
          </div>
        </div>

        {/* Prochains prélèvements */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Prochains prélèvements
          </h4>
          
          {upcomingSubscriptions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Aucun prélèvement dans les 7 prochains jours
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingSubscriptions.map((sub) => {
                const isToday = sub.billingDate === today;
                const isTomorrow = sub.billingDate === today + 1;
                
                return (
                  <div 
                    key={sub.id} 
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isToday ? 'bg-red-50 border border-red-100' : 
                      isTomorrow ? 'bg-amber-50 border border-amber-100' : 
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                        <p className={`text-xs ${isToday ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {getDaysUntil(sub.billingDate)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(sub.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Play className="h-3 w-3 text-green-500" />
            <span>{activeSubscriptions.length} actif{activeSubscriptions.length > 1 ? 's' : ''}</span>
          </div>
          {inactiveCount > 0 && (
            <div className="flex items-center gap-1">
              <Pause className="h-3 w-3 text-gray-400" />
              <span>{inactiveCount} en pause</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

