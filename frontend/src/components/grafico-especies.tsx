"use client"
import React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { especie: "Perro", cantidad: 802 },
  { especie: "Gato", cantidad: 451 },
  { especie: "Exótico", cantidad: 57 },
  { especie: "Ave", cantidad: 90 },
]

export function GraficoEspecies({ data: propsData }: { data?: any[] }) {
  const chartData = propsData || data
  return (
    <Card className="col-span-1 border shadow-sm">
      <CardHeader>
        <CardTitle>Distribución por especie</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="especie" />
            <YAxis />
            <Tooltip cursor={{ fill: "transparent" }} />
            <Bar dataKey="cantidad" fill="#BA7517" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
