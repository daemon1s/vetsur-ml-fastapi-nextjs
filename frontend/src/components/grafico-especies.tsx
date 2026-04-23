"use client"
import React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint } from "lucide-react"

const fallback = [
  { especie: "Perro", cantidad: 802 },
  { especie: "Gato", cantidad: 451 },
  { especie: "Exótico", cantidad: 57 },
  { especie: "Ave", cantidad: 90 },
]

const COLORS = ["#1D9E75", "#2bbf8e", "#E24B4A", "#BA7517"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-muted-foreground">Pacientes: <span className="text-foreground font-semibold">{payload[0].value}</span></p>
      </div>
    )
  }
  return null
}

export function GraficoEspecies({ data: propsData }: { data?: any[] }) {
  const chartData = propsData || fallback
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <PawPrint className="h-4 w-4 text-[#1D9E75]" />
          Distribución por especie
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <XAxis dataKey="especie" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} barSize={48}>
              {chartData.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
