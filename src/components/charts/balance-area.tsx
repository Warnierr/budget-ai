"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { formatCurrency } from "@/lib/utils"

type DataPoint = {
  date: string;
  solde: number;
  revenus: number;
  depenses: number;
}

export function BalanceAreaChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-gray-400">Pas assez de données pour la courbe</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          minTickGap={30}
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => `${value}€`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          formatter={(value: number) => [formatCurrency(value), ""]}
          labelStyle={{ color: '#6b7280', marginBottom: '0.5rem' }}
        />
        <Area 
          type="monotone" 
          dataKey="solde" 
          stroke="#3b82f6" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorSolde)" 
          name="Solde cumulé"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

