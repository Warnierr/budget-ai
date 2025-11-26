"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2, Check, Eye, EyeOff } from "lucide-react";

export interface WidgetPreferences {
  balance: boolean;
  forecast: boolean;
  flows: boolean;
  chart: boolean;
  pie: boolean;
  goals: boolean;
  subscriptions: boolean;
  activity: boolean;
  advice: boolean;
}

interface WidgetSettingsProps {
  preferences: WidgetPreferences;
  onSave: (prefs: WidgetPreferences) => void;
}

const WIDGET_LABELS: Record<keyof WidgetPreferences, { label: string; description: string }> = {
  balance: { label: "Solde actuel", description: "Votre trésorerie disponible" },
  forecast: { label: "Projection fin de mois", description: "Prévision avec abonnements restants" },
  flows: { label: "Flux mensuels", description: "Entrées et sorties du mois" },
  chart: { label: "Courbe d'évolution", description: "Graphique du solde jour par jour" },
  pie: { label: "Répartition dépenses", description: "Camembert par catégorie" },
  goals: { label: "Objectifs financiers", description: "Progression de vos objectifs" },
  subscriptions: { label: "Abonnements", description: "Prochains prélèvements" },
  activity: { label: "Activité récente", description: "Dernières transactions" },
  advice: { label: "Conseils", description: "Analyse et recommandations" },
};

export function WidgetSettings({ preferences, onSave }: WidgetSettingsProps) {
  const [open, setOpen] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<WidgetPreferences>(preferences);
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof WidgetPreferences) => {
    setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(localPrefs);
    setSaving(false);
    setOpen(false);
  };

  const activeCount = Object.values(localPrefs).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Personnaliser
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-blue-600" />
            Personnaliser le Dashboard
          </DialogTitle>
          <DialogDescription>
            Choisissez les widgets à afficher sur votre tableau de bord.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
          {(Object.keys(WIDGET_LABELS) as Array<keyof WidgetPreferences>).map((key) => {
            const { label, description } = WIDGET_LABELS[key];
            const isActive = localPrefs[key];
            
            return (
              <button
                key={key}
                onClick={() => handleToggle(key)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-left">
                  <p className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-600'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500">
            {activeCount} widget{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>Sauvegarde...</>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

