import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  ArrowDownRight,
  ArrowUpRight,
  Flame,
  Trophy,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Activity = {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: "income" | "expense";
};

interface WidgetActivityProps {
  activities: Activity[];
  accountLabel?: string;
}

const HIGH_SPEND_THRESHOLD = 200;

function formatDayLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Aujourd'hui";
  if (sameDay(date, yesterday)) return "Hier";
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function WidgetActivity({ activities, accountLabel }: WidgetActivityProps) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const grouped = sorted.reduce<Record<string, Activity[]>>((acc, activity) => {
    const label = formatDayLabel(new Date(activity.date));
    acc[label] = acc[label] ? [...acc[label], activity] : [activity];
    return acc;
  }, {});

  const hasHighExpense = sorted.some(
    (item) => item.type === "expense" && item.amount >= HIGH_SPEND_THRESHOLD
  );

  const trendMessage =
    sorted.filter((item) => item.type === "income").length >=
    sorted.filter((item) => item.type === "expense").length
      ? "Flux positif sur les dernières opérations"
      : "Les dépenses prennent le dessus cette semaine";

  return (
    <Card className="shadow-sm border-slate-100 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-gray-500" />
          Activité intelligente
        </CardTitle>
        <CardDescription>
          {accountLabel
            ? `Derniers mouvements sur ${accountLabel}`
            : "Suivi consolidé de toutes vos opérations"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 space-y-6">
        {sorted.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Encore aucune activité ce mois-ci.</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-purple-500" />
              {trendMessage}
              {hasHighExpense && (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <Flame className="h-3 w-3" />
                  pic de dépense détecté
                </span>
              )}
            </div>

            <div className="space-y-8">
              {Object.entries(grouped).map(([label, items]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                  <div className="mt-3 relative pl-6 space-y-5">
                    <span className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
                    {items.map((item, index) => {
                      const isIncome = item.type === "income";
                      const highlight = !isIncome && item.amount >= HIGH_SPEND_THRESHOLD;

                      return (
                        <div key={item.id} className="relative flex items-start justify-between gap-4">
                          <span
                            className={`absolute -left-1 top-2 h-2 w-2 rounded-full ${
                              isIncome ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {item.name}
                              </p>
                              {highlight && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                  <Flame className="h-3 w-3" />
                                  élevé
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {new Date(item.date).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div
                            className={`text-sm font-bold whitespace-nowrap ${
                              isIncome ? "text-emerald-600" : "text-slate-900"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(Number(item.amount))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                Ajouter un revenu
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowDownRight className="h-4 w-4 text-rose-600" />
                Ajouter une dépense
              </Button>
            </div>
          </>
        )}

        <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link
            href="/dashboard/expenses"
            className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            Transactions détaillées
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/dashboard/ai"
            className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900"
          >
            Analyse IA
            <Trophy className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

