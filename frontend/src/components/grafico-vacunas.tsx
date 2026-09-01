"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { VacioPanel } from "@/components/estados"
import type { EstadisticaVacunas } from "@/types/vetsur"

interface GraficoVacunasProps {
  vacunas?: EstadisticaVacunas
}

export function GraficoVacunas({ vacunas }: GraficoVacunasProps) {
  if (!vacunas) {
    return (
      <Card className="border border-slate-800 bg-[#131d2e] flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <CardTitle className="text-base font-bold text-white tracking-tight">
            Impacto del esquema de vacunas
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">
            Comparativa de tasa de retorno con vacunas al día vs vacunas vencidas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <VacioPanel
            titulo="Sin datos de vacunación"
            detalle="No hay información de esquemas vacunales para el período consultado."
          />
        </CardContent>
      </Card>
    )
  }

  const {
    tasa_con_vacunas,
    tasa_sin_vacunas,
    al_dia_total,
    vencidas_total,
    diferencia,
  } = vacunas

  const riesgoConVacunas = Number((100 - tasa_con_vacunas).toFixed(1))
  const riesgoSinVacunas = Number((100 - tasa_sin_vacunas).toFixed(1))

  return (
    <Card className="border border-slate-800 bg-[#131d2e] flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-white tracking-tight">
              Impacto del esquema de vacunas
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Comparativa de tasa de retorno con vacunas al día vs vacunas vencidas
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#16a085]/15 px-2.5 py-1 text-xs font-semibold text-[#16a085] border border-[#16a085]/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>+{diferencia}% retorno con vacunas</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#16a085]" />
                <span className="text-xs font-bold text-slate-200">
                  Vacunas al día ({al_dia_total.toLocaleString()} pacientes)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#16a085]">
                {tasa_con_vacunas}% retorno
              </span>
            </div>

            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${tasa_con_vacunas}%` }}
                className="h-full bg-[#16a085] transition-all duration-700"
                title={`Retorno: ${tasa_con_vacunas}%`}
              />
              <div
                style={{ width: `${riesgoConVacunas}%` }}
                className="h-full bg-[#e74c3c] transition-all duration-700"
                title={`Abandono: ${riesgoConVacunas}%`}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-[#16a085] font-semibold">{tasa_con_vacunas}% retorno</span>
              <span className="text-[#e74c3c] font-semibold">{riesgoConVacunas}% abandono</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#e74c3c]" />
                <span className="text-xs font-bold text-slate-200">
                  Vacunas vencidas ({vencidas_total.toLocaleString()} pacientes)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                {tasa_sin_vacunas}% retorno
              </span>
            </div>

            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${tasa_sin_vacunas}%` }}
                className="h-full bg-[#16a085] transition-all duration-700"
                title={`Retorno: ${tasa_sin_vacunas}%`}
              />
              <div
                style={{ width: `${riesgoSinVacunas}%` }}
                className="h-full bg-[#e74c3c] transition-all duration-700"
                title={`Abandono: ${riesgoSinVacunas}%`}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-[#16a085] font-semibold">{tasa_sin_vacunas}% retorno</span>
              <span className="text-[#e74c3c] font-semibold">{riesgoSinVacunas}% abandono</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-3 text-xs text-slate-300 border border-slate-800">
          <p className="leading-relaxed">
            La vacunación al día es el factor protector más fuerte del modelo: la retención pasa de{" "}
            {tasa_sin_vacunas}% a {tasa_con_vacunas}%.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}