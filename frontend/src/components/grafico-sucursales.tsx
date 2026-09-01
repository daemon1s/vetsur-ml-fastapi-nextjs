"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { VacioPanel } from "@/components/estados"
import type { EstadisticaSucursal } from "@/types/vetsur"

interface GraficoSucursalesProps {
  data?: EstadisticaSucursal[]
}

export function GraficoSucursales({ data = [] }: GraficoSucursalesProps) {
  const [hoveredSucursal, setHoveredSucursal] = useState<string | null>(null)

  const items = data || []
  const totalPeriodo = items.reduce((acc, curr) => acc + curr.retorno + curr.riesgo, 0)
  const totalRetorno = items.reduce((acc, curr) => acc + curr.retorno, 0)
  const tasaGlobal = totalPeriodo > 0 ? ((totalRetorno / totalPeriodo) * 100).toFixed(1) : "0.0"

  return (
    <Card className="border border-slate-800 bg-[#131d2e] shadow-md flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-white tracking-tight">
                Retención de pacientes por sucursal
              </CardTitle>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#16a085]/15 text-[#16a085] border border-[#16a085]/30">
                {tasaGlobal}% global
              </span>
            </div>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Comparativa de pacientes fidelizados vs pacientes en riesgo por clínica
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <span>{items.length} sucursales activas</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 pb-4 px-4 space-y-3">
        {items.length === 0 ? (
          <VacioPanel
            titulo="Sin datos de sucursales"
            detalle="No hay información por clínica para el período consultado."
          />
        ) : (
          <>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 px-1 border-b border-slate-800/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#16a085]" />
              <span className="text-slate-300">Fidelizados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#e74c3c]" />
              <span className="text-slate-300">En riesgo</span>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item) => {
            const total = item.retorno + item.riesgo
            const pctRetorno = total > 0 ? (item.retorno / total) * 100 : 0
            const isHovered = hoveredSucursal === item.sucursal

            return (
              <div
                key={item.sucursal}
                onMouseEnter={() => setHoveredSucursal(item.sucursal)}
                onMouseLeave={() => setHoveredSucursal(null)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isHovered
                    ? "bg-slate-900 border-slate-700 shadow-md"
                    : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">{item.sucursal}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-[#16a085] font-bold">{item.retorno}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-rose-400 font-bold">{item.riesgo}</span>
                    <span className="text-slate-400 font-medium ml-1">({pctRetorno.toFixed(0)}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    style={{ width: `${pctRetorno}%` }}
                    className="h-full bg-[#16a085] transition-all duration-300"
                  />
                  <div
                    style={{ width: `${100 - pctRetorno}%` }}
                    className="h-full bg-[#e74c3c] transition-all duration-300"
                  />
                </div>
              </div>
            )
          })}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
