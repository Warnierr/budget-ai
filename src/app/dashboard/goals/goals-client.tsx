"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, calculatePercentage } from "@/lib/utils";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
};

export function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount || "0"),
          deadline: formData.deadline || null,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création");

      toast({
        title: "Objectif créé !",
        description: "Votre nouvel objectif a été ajouté avec succès.",
      });

      setOpen(false);
      setFormData({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
      router.refresh(); // Rafraîchit les données du Server Component
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'objectif.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Objectifs Financiers</h2>
          <p className="text-muted-foreground">
            Définissez et suivez vos projets d'épargne.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Objectif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel objectif</DialogTitle>
              <DialogDescription>
                Définissez un montant cible et une date pour votre projet.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet</Label>
                <Input
                  id="name"
                  placeholder="Ex: Vacances au Japon"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Montant cible (€)</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="2000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current">Déjà économisé (€)</Label>
                  <Input
                    id="current"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Date cible (optionnel)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Création..." : "Créer l'objectif"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {initialGoals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-full">
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Aucun objectif défini</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Commencez par définir un objectif d'épargne pour visualiser votre progression.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialGoals.map((goal) => {
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
            const isCompleted = percentage >= 100;

            return (
              <Card key={goal.id} className={isCompleted ? "border-green-200 bg-green-50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{goal.name}</CardTitle>
                    {isCompleted && <Trophy className="h-5 w-5 text-yellow-500" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-bold">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500">Actuel</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Cible</p>
                      <p className="text-sm font-medium text-gray-600">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="pt-2 border-t text-xs text-gray-500 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Objectif : {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

