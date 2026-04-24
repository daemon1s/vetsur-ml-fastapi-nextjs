"use client"
import React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { PawPrint } from "lucide-react"

const fallback = [
  { especie: "Perro", cantidad: 802 },
  { especie: "Gato", cantidad: 451 },
  { especie: "Ave", cantidad: 90 },
  { especie: "Exótico", cantidad: 57 },
]

const COLORS = ["#1D9E75", "#25C08F", "#E24B4A", "#FBBF24"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#13141C]/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl transition-all duration-300">
        <p className="font-bold text-white text-[10px] uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-white/50 uppercase">Población</span>
          <span className="text-lg font-bold text-white tracking-widest">{payload[0].value}</span>
        </div>
      </div>
    )
  }
  return null
}

export function GraficoEspecies({ data: propsData }: { data?: any[] }) {
  const chartData = propsData || fallback
  return (
    <div className="bg-[#13141C]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] shadow-2xl transition-all hover:border-white/10 group overflow-hidden relative">
      <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <PawPrint className="h-4 w-4 text-[#1D9E75]" />
          </div>
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Distribución Especies</h3>
        </div>
      </div>

      <div className="h-[280px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="especie" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="cantidad" radius={[12, 12, 8, 8]} barSize={40}>
              {chartData.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
