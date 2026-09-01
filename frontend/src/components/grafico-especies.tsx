"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { VacioPanel } from "@/components/estados"
import type { EstadisticaEspecie } from "@/types/vetsur"

interface GraficoEspeciesProps {
  data?: EstadisticaEspecie[]
}

const PALETA_NOTEBOOK: Record<string, string> = {
  Perro: "#16a085",
  Gato: "#3498db",
  Exótico: "#f39c12",
  Exotico: "#f39c12",
  Ave: "#9b59b6",
}

export function GraficoEspecies({ data = [] }: GraficoEspeciesProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const chartData = data || []
  const total = chartData.reduce((acc, curr) => acc + (curr.cantidad || 0), 0)

  const radius = 55
  const circumference = 2 * Math.PI * radius
  let accumulatedOffset = 0

  const slices = chartData.map((item) => {
    const pct = total > 0 ? item.cantidad / total : 0
    const strokeDash = pct * circumference
    const offset = accumulatedOffset
    accumulatedOffset += strokeDash
    const color = PALETA_NOTEBOOK[item.especie] || "#16a085"

    return {
      especie: item.especie,
      cantidad: item.cantidad,
      pct: (pct * 100).toFixed(1),
      strokeDash,
      offset,
      color,
    }
  })

  return (
    <Card className="border border-slate-800 bg-[#131d2e] shadow-md flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div>
          <CardTitle className="text-base font-bold text-white tracking-tight">
            Distribución por especie
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">
            Composición demográfica de la red
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {chartData.length === 0 ? (
          <VacioPanel
            titulo="Sin datos de especies"
            detalle="No hay composición demográfica para el período consultado."
          />
        ) : (
          <>
        <div className="relative w-full h-[180px] flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="20"
            />

            {slices.map((slice) => (
              <circle
                key={slice.especie}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={hovered === slice.especie ? "24" : "20"}
                strokeDasharray={`${slice.strokeDash} ${circumference}`}
                strokeDashoffset={-slice.offset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHovered(slice.especie)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-white">
              {hovered
                ? `${slices.find((s) => s.especie === hovered)?.pct}%`
                : total.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {hovered || "Total"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {slices.map((item) => (
            <div
              key={item.especie}
              onMouseEnter={() => setHovered(item.especie)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                hovered === item.especie
                  ? "bg-slate-800 border-slate-600 shadow-md"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-200">{item.especie}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="font-bold text-white">{item.cantidad}</span>
                <span className="text-slate-400 text-[11px]">({item.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
