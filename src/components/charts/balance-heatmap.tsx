"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { Info } from "lucide-react";

type HeatmapDatum = {
  date: string;
  value: number;
  isProjection?: boolean;
  revenues?: number;
  expenses?: number;
  subscriptions?: number;
};

interface BalanceHeatmapProps {
  data: HeatmapDatum[];
  startDate: Date;
  endDate: Date;
  projectionEndDate?: Date;
  projectionSummary?: {
    revenues: number;
    subscriptions: number;
    plannedExpenses: number;
    net: number;
  };
}

const VALUE_BUCKETS = [
  { threshold: 500, className: "bg-emerald-600 text-white" },
  { threshold: 250, className: "bg-emerald-500 text-white" },
  { threshold: 50, className: "bg-emerald-300 text-emerald-900" },
  { threshold: 0, className: "bg-slate-200 text-slate-600" },
  { threshold: -50, className: "bg-rose-100 text-rose-700" },
  { threshold: -250, className: "bg-rose-300 text-rose-900" },
  { threshold: -Infinity, className: "bg-rose-600 text-white" },
];

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function getBucketClass(value: number) {
  const bucket = VALUE_BUCKETS.find((b) => value >= b.threshold);
  return bucket?.className ?? "bg-slate-200 text-slate-600";
}

function formatTooltip(
  date: Date,
  value: number,
  meta?: { isProjection?: boolean; revenues?: number; expenses?: number; subscriptions?: number }
) {
  const label = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedValue =
    value === 0 ? "Équilibré" : value > 0 ? `+${value.toFixed(2)} €` : `${value.toFixed(2)} €`;
  const lines = [`${label} · ${formattedValue}${meta?.isProjection ? " (projection)" : ""}`];

  if (meta?.revenues) {
    lines.push(`Revenus : ${meta.revenues.toFixed(2)} €`);
  }
  const expenses = meta?.expenses ?? 0;
  if (expenses > 0) {
    lines.push(`Dépenses prévues : -${expenses.toFixed(2)} €`);
  }
  const subscriptions = meta?.subscriptions ?? 0;
  if (subscriptions > 0) {
    lines.push(`Abonnements : -${subscriptions.toFixed(2)} €`);
  }

  return lines.join("\n");
}

export function BalanceHeatmap({
  data,
  startDate,
  endDate,
  projectionEndDate,
  projectionSummary,
}: BalanceHeatmapProps) {
  const [showProjection, setShowProjection] = useState(false);

  const dataset = useMemo(
    () => (showProjection ? data : data.filter((point) => !point.isProjection)),
    [showProjection, data]
  );

  const valueMap = useMemo(() => {
    const map = new Map<
      string,
      { value: number; isProjection: boolean; revenues?: number; expenses?: number; subscriptions?: number }
    >();
    dataset.forEach((point) => {
      map.set(point.date, {
        value: point.value,
        isProjection: Boolean(point.isProjection),
        revenues: point.revenues,
        expenses: point.expenses,
        subscriptions: point.subscriptions,
      });
    });
    return map;
  }, [dataset]);

  if (dataset.length === 0) {
    return null;
  }

  const effectiveEndDate = showProjection && projectionEndDate ? projectionEndDate : endDate;

  const getValueForDate = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    return valueMap.get(key) ?? { value: 0, isProjection: false };
  };

  const firstDay = alignToMonday(startDate);
  const lastDay = alignToSunday(effectiveEndDate);

  const weeks: {
    date: Date;
    value: number;
    isProjection: boolean;
    revenues?: number;
    expenses?: number;
    subscriptions?: number;
  }[][] = [];
  let currentWeek: {
    date: Date;
    value: number;
    isProjection: boolean;
    revenues?: number;
    expenses?: number;
    subscriptions?: number;
  }[] = [];

  for (let cursor = new Date(firstDay); cursor <= lastDay; cursor.setDate(cursor.getDate() + 1)) {
    const cellDate = new Date(cursor);
    const cellInfo = getValueForDate(cellDate);
    currentWeek.push({
      date: cellDate,
      value: cellInfo.value,
      isProjection: cellInfo.isProjection,
      revenues: cellInfo.revenues,
      expenses: cellInfo.expenses,
      subscriptions: cellInfo.subscriptions,
    });

    if (cellDate.getDay() === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const positiveDays = dataset.filter((d) => d.value > 0).length;
  const negativeDays = dataset.filter((d) => d.value < 0).length;

  return (
    <Card className="shadow-sm border-slate-100">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Heatmap quotidienne</CardTitle>
            <CardDescription>
              Impact net (revenus - dépenses) par jour sur {weeks.length} semaines
              {showProjection ? " (historique + projection)" : ""}.
            </CardDescription>
          </div>
          <Button
            variant={showProjection ? "default" : "outline"}
            size="sm"
            onClick={() => setShowProjection((prev) => !prev)}
            className="self-start md:self-auto"
          >
            {showProjection ? "Masquer la projection" : "Afficher la projection"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex flex-col justify-between text-[10px] text-slate-400">
            {DAY_LABELS.map((label, idx) => (
              <span key={label + idx} className={idx === 5 || idx === 6 ? "text-slate-300" : ""}>
                {label}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                  {week.map((cell, dIdx) => (
                    <div
                      key={cell.date.toISOString()}
                      className={cn(
                        "h-4 w-4 rounded-sm transition-colors duration-200",
                        getBucketClass(cell.value),
                        showProjection && cell.isProjection && "border border-dashed border-slate-400 opacity-80"
                      )}
                      title={formatTooltip(cell.date, cell.value, {
                        isProjection: showProjection && cell.isProjection,
                        revenues: cell.revenues,
                        expenses: cell.expenses,
                        subscriptions: cell.subscriptions,
                      })}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              Jours positifs {positiveDays}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-rose-400" />
              Jours négatifs {negativeDays}
            </span>
            {showProjection && (
              <span className="inline-flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm border border-dashed border-slate-400" />
                Projection
              </span>
            )}
          </div>
          <div className="inline-flex items-center gap-2">
            <Info className="h-3 w-3" />
            {startDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} →
            {effectiveEndDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
          </div>
        </div>

        {showProjection && projectionSummary && (
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <ProjectionStat
              label="Revenus prévus"
              value={formatCurrency(projectionSummary.revenues)}
              accent="text-emerald-600"
            />
            <ProjectionStat
              label="Abonnements"
              value={formatCurrency(-projectionSummary.subscriptions)}
              accent="text-rose-600"
            />
            <ProjectionStat
              label="Dépenses prévues"
              value={formatCurrency(-projectionSummary.plannedExpenses)}
              accent="text-amber-600"
            />
            <ProjectionStat
              label="Impact net (3 mois)"
              value={formatCurrency(projectionSummary.net)}
              accent={projectionSummary.net >= 0 ? "text-blue-600" : "text-red-600"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectionStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function alignToMonday(date: Date) {
  const aligned = new Date(date);
  const day = aligned.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  aligned.setDate(aligned.getDate() + diff);
  aligned.setHours(0, 0, 0, 0);
  return aligned;
}

function alignToSunday(date: Date) {
  const aligned = new Date(date);
  const day = aligned.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  aligned.setDate(aligned.getDate() + diff);
  aligned.setHours(0, 0, 0, 0);
  return aligned;
}

