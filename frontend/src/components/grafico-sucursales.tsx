"use client"
import React, { useState } from "react"
import { 
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { sucursal: "Las Condes", pacientes: 120, retorno: 80, riesgo: 40 },
  { sucursal: "Providencia", pacientes: 90, retorno: 60, riesgo: 30 },
  { sucursal: "Ñuñoa", pacientes: 150, retorno: 110, riesgo: 40 },
  { sucursal: "Maipú", pacientes: 200, retorno: 120, riesgo: 80 },
  { sucursal: "La Florida", pacientes: 110, retorno: 70, riesgo: 40 },
]

export function GraficoSucursales({ data: propsData }: { data?: any[] }) {
  const chartData = propsData || data
  return (
    <Card className="col-span-1 border shadow-sm">
      <CardHeader>
        <CardTitle>Pacientes por sucursal</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis dataKey="sucursal" type="category" width={80} fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="riesgo" stackId="a" fill="#E24B4A" radius={[0, 0, 0, 0]} name="Alto riesgo" />
            <Bar dataKey="retorno" stackId="a" fill="#1D9E75" radius={[0, 4, 4, 0]} name="Retorno probable" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
