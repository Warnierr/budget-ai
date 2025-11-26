"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  isCompleted: boolean;
}

interface WidgetGoalsProps {
  goals: Goal[];
}

export function WidgetGoals({ goals }: WidgetGoalsProps) {
  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);
  const completedCount = goals.filter(g => g.isCompleted).length;
  
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const globalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <Card className="shadow-sm border-slate-100 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Objectifs
          </CardTitle>
          <Link 
            href="/dashboard/goals" 
            className="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1"
          >
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progression globale */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-purple-700 font-medium">Progression globale</span>
            <span className="text-purple-900 font-bold">{Math.round(globalProgress)}%</span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(totalCurrent)}</span>
            <span>{formatCurrency(totalTarget)}</span>
          </div>
        </div>

        {/* Liste des objectifs actifs */}
        {activeGoals.length === 0 ? (
          <div className="text-center py-4">
            <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucun objectif en cours</p>
            <Link 
              href="/dashboard/goals" 
              className="text-xs text-purple-600 hover:underline"
            >
              Créer un objectif
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.currentAmount;
              
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[60%]">
                      {goal.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatCurrency(remaining)} restant
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-gray-400">
                      Échéance : {new Date(goal.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats rapides */}
        <div className="flex justify-between pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-purple-500" />
            <span>{activeGoals.length} en cours</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>{completedCount} terminé{completedCount > 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

