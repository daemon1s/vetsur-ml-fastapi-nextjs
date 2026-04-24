"use client"
import React from "react"
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell
} from "recharts"
import { MapPin } from "lucide-react"

const fallback = [
  { sucursal: "Las Condes", riesgo: 40, retorno: 80 },
  { sucursal: "Providencia", riesgo: 30, retorno: 60 },
  { sucursal: "Ñuñoa", riesgo: 40, retorno: 110 },
  { sucursal: "Maipú", riesgo: 80, retorno: 120 },
  { sucursal: "La Florida", riesgo: 40, retorno: 70 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#13141C]/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in-up">
        <p className="font-bold text-white text-[10px] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-6">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-tight">{p.name}</span>
              <span className="text-sm font-bold" style={{ color: p.fill }}>{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function GraficoSucursales({ data: propsData }: { data?: any[] }) {
  const chartData = propsData || fallback
  return (
    <div className="bg-[#13141C]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] shadow-2xl transition-all hover:border-white/10 group overflow-hidden relative">
      <div className="absolute -left-16 -top-16 w-32 h-32 bg-[#1D9E75]/5 blur-[60px] pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <MapPin className="h-4 w-4 text-[#1D9E75]" />
          </div>
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Censo por Sucursal</h3>
        </div>
      </div>

      <div className="h-[280px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="sucursal"
              type="category"
              width={100}
              tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ paddingTop: '20px', fontSize: "9px", fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}
            />
            <Bar dataKey="riesgo" stackId="a" fill="#E24B4A" radius={[0, 0, 0, 0]} name="Alto riesgo" barSize={12} />
            <Bar dataKey="retorno" stackId="a" fill="#1D9E75" radius={[0, 10, 10, 0]} name="Retorno probable" barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
