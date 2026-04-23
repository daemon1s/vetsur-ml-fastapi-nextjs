"use client"
import React from "react"
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }} className="font-medium">
            {p.name}: <span className="text-foreground">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function GraficoSucursales({ data: propsData }: { data?: any[] }) {
  const chartData = propsData || fallback
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <MapPin className="h-4 w-4 text-[#1D9E75]" />
          Pacientes por sucursal
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="sucursal" type="category" width={90} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
            <Bar dataKey="riesgo" stackId="a" fill="#E24B4A" radius={[0, 0, 0, 0]} name="Alto riesgo" />
            <Bar dataKey="retorno" stackId="a" fill="#1D9E75" radius={[0, 4, 4, 0]} name="Retorno probable" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
