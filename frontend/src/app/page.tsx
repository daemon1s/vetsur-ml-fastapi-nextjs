"use client"
import React, { useState, useEffect } from "react"
import { apiObj } from "@/lib/api"
import { TarjetaKpi } from "@/components/tarjetas-kpi"
import { GraficoSucursales } from "@/components/grafico-sucursales"
import { GraficoEspecies } from "@/components/grafico-especies"
import { TablaPacientes } from "@/components/tabla-pacientes"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const load = async () => {
        try {
            const res = await apiObj.obtenerEstadisticas()
            setStats(res)
        } catch (e) {
            console.error("Error cargando stats:", e)
        }
    }
    load()
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">VetSur Dashboard</h1>
            <p className="text-slate-400 font-medium tracking-tight">Análisis inteligente de retención de pacientes</p>
          </div>
          <Badge className="bg-[#1D9E75] px-4 py-1 text-sm font-bold shadow-sm">Recall 90% (Live Model)</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TarjetaKpi titulo="Riesgo crítico" valor={String(stats?.kpis?.riesgo_alto ?? "...")} delta="Alto" icono="usuarios" positivo={false} />
          <TarjetaKpi titulo="Inactivos 90d" valor={String(stats?.kpis?.visitas_90 ?? "...")} delta="Alerta" icono="calendario" positivo={false} />
          <TarjetaKpi titulo="Tasa de retención" valor={stats?.kpis?.tasa_retencion ?? "..."} delta="KPI" icono="tendencia" positivo={true} />
          <TarjetaKpi titulo="Recuperación" valor={String(stats?.kpis?.recuperados ?? "...")} delta="Meta" icono="actividad" positivo={true} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-2 rounded-2xl shadow-sm border overflow-hidden">
                <GraficoSucursales data={stats?.sucursales} />
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-sm border overflow-hidden">
                <GraficoEspecies data={stats?.especies} />
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border overflow-hidden">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Panel de acción CRM (pacientes reales)</h2>
          <TablaPacientes />
        </div>

      </div>
    </div>
  )
}
