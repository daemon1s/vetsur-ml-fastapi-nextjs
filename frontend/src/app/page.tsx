"use client"

import React, { useState, useEffect, useCallback } from "react"
import { apiObj } from "@/lib/api"
import { TarjetasKpiEjecutivas } from "@/components/tarjetas-kpi"
import { SemaforoPacientes } from "@/components/semaforo-pacientes"
import { GraficoSucursales } from "@/components/grafico-sucursales"
import { GraficoVacunas } from "@/components/grafico-vacunas"
import { GraficoEspecies } from "@/components/grafico-especies"
import { TablaPacientes } from "@/components/tabla-pacientes"
import { ErrorPanel } from "@/components/estados"
import type { RespuestaEstadisticas } from "@/types/vetsur"

export default function Dashboard() {
  const [stats, setStats] = useState<RespuestaEstadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarEstadisticas = useCallback(() => {
    setLoading(true)
    setError(null)
    apiObj
      .obtenerEstadisticas()
      .then((res) => {
        if (res && res.kpis) {
          setStats(res)
        }
      })
      .catch(() => {
        setError("No se pudo conectar con la API de estadísticas. Verificá que el backend esté disponible.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    cargarEstadisticas()
  }, [cargarEstadisticas])

  const kpis = stats?.kpis || {}

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 antialiased pb-16">
      <div className="bg-[#0b1320]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Panel de control de retención
              </h1>
              <p className="mt-1 text-xs text-slate-400 max-w-2xl">
                Monitoreo predictivo y censo de retención para las 8 clínicas de la red VetSur.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-0 space-y-5">
        {error && <ErrorPanel mensaje={error} onReintentar={cargarEstadisticas} />}

        <TarjetasKpiEjecutivas kpis={kpis} cargando={loading} />

        <SemaforoPacientes
          totalPacientes={kpis.total_pacientes}
          riesgoAlto={kpis.riesgo_alto}
          riesgoMedio={kpis.riesgo_medio ?? kpis.visitas_90}
          riesgoBajo={kpis.riesgo_bajo}
          cargando={loading}
        />

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <GraficoSucursales data={stats?.sucursales || []} />
          </div>
          <div className="lg:col-span-5">
            <GraficoEspecies data={stats?.especies || []} />
          </div>
        </div>

        <div className="lg:col-span-12">
          <GraficoVacunas vacunas={stats?.vacunas} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131d2e] p-5">
          <TablaPacientes />
        </div>
      </main>
    </div>
  )
}