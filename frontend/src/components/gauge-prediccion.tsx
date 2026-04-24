"use client"
import React from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

interface GaugeProps {
  probabilidad: number
  riesgo: "Alto" | "Medio" | "Bajo"
}

export function GaugePrediccion({ probabilidad, riesgo }: GaugeProps) {
  // Nota: El porcentaje y el color cambian dinámicamente según el nivel de riesgo que devuelve el modelo.
  const percentage = Math.round(probabilidad * 100)
  
  let fill = "#1D9E75" // Verde
  if (riesgo === "Alto") fill = "#E24B4A"
  else if (riesgo === "Medio") fill = "#BA7517"

  const data = [
    { name: 'Probabilidad', value: percentage, fill }
  ]

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <ResponsiveContainer width={200} height={200}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="90%" 
          barSize={15} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            background={{ fill: '#e5e7eb' }}
            clockWise
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex items-center justify-center mt-8 space-x-1 flex-col">
          <span className="text-4xl font-bold" style={{ color: fill }}>{percentage}%</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Abandono</span>
      </div>
    </div>
  )
}
