"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

type OverviewData = {
  name: string;
  revenus: number;
  depenses: number;
}

export function OverviewBarChart({ data }: { data: OverviewData[] }) {
  if (!data || data.length === 0) {
     return <div className="h-[350px] flex items-center justify-center text-gray-400">Pas assez de données</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}€`}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend />
        <Bar dataKey="revenus" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenus" />
        <Bar dataKey="depenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Dépenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}

