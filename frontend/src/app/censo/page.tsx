"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Users, ChevronLeft, AlertOctagon, Clock, TrendingUp } from "lucide-react"
import { TablaPacientes } from "@/components/tabla-pacientes"
import { FichaKpi, formatearNumero } from "@/components/tarjetas-kpi"
import { ErrorPanel } from "@/components/estados"
import { apiObj } from "@/lib/api"
import type { RespuestaEstadisticas } from "@/types/vetsur"

export default function CensoPage() {
  const [stats, setStats] = useState<RespuestaEstadisticas | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarEstadisticas = useCallback(() => {
    setCargando(true)
    setError(null)
    apiObj
      .obtenerEstadisticas()
      .then((res) => setStats(res))
      .catch(() => {
        setError("No se pudo conectar con la API de estadísticas. Verificá que el backend esté disponible.")
      })
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    cargarEstadisticas()
  }, [cargarEstadisticas])

  const kpis = stats?.kpis || {}
  const total = kpis?.total_pacientes ?? 0
  const riesgoAlto = kpis?.riesgo_alto ?? 0
  const visitas90 = kpis?.riesgo_medio ?? kpis?.visitas_90 ?? 0
  const tasaRetencion = kpis?.tasa_retencion ?? "0.0%"

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 antialiased pb-16">
      <div className="border-b border-slate-800/80 bg-[#0b1320]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Volver al dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Censo general y pacientes en riesgo
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-0 space-y-5">
        {error && <ErrorPanel mensaje={error} onReintentar={cargarEstadisticas} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FichaKpi
            etiqueta="Total del censo"
            valor={formatearNumero(total)}
            detalle="Pacientes activos registrados en la red"
            colorAcento="border-t-[#3498db]"
            icono={Users}
            cargando={cargando}
          />
          <FichaKpi
            etiqueta="Pacientes en riesgo alto"
            valor={formatearNumero(riesgoAlto)}
            detalle="Probabilidad de abandono mayor a 65%"
            colorAcento="border-t-[#e74c3c]"
            icono={AlertOctagon}
            cargando={cargando}
          />
          <FichaKpi
            etiqueta="Ventana preventiva"
            valor={formatearNumero(visitas90)}
            detalle="Entre 30 y 90 días sin visita"
            colorAcento="border-t-[#f39c12]"
            icono={Clock}
            cargando={cargando}
          />
          <FichaKpi
            etiqueta="Retención global"
            valor={tasaRetencion}
            detalle="Estimación del modelo sobre el censo activo"
            colorAcento="border-t-[#16a085]"
            icono={TrendingUp}
            cargando={cargando}
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131d2e] p-5">
          <TablaPacientes />
        </div>
      </main>
    </div>
  )
}