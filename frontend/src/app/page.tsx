"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { apiObj } from "@/lib/api"
import { TarjetaKpiML } from "@/components/tarjetas-kpi"
import { GraficoSucursales } from "@/components/grafico-sucursales"
import { GraficoEspecies } from "@/components/grafico-especies"
import { TablaPacientes } from "@/components/tabla-pacientes"
import { Badge } from "@/components/ui/badge"
import { Activity, Brain, ChevronRight } from "lucide-react"

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
    <div className="flex min-h-screen w-full flex-col bg-background pattern-bg">
      <div className="max-w-7xl mx-auto w-full space-y-6 p-6 lg:p-8">

        {/* Header */}
        <div className="flex justify-between items-center bg-card border border-border rounded-2xl px-6 py-4 shadow-lg animate-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20">
              <Activity className="h-6 w-6 text-[#1D9E75]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">VetSur</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/predictor"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#1D9E75] transition-colors border border-border rounded-lg px-3 py-2 hover:border-[#1D9E75]/40"
            >
              <Brain className="h-3.5 w-3.5" />
              Predictor
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 animate-in-up" style={{ animationDelay: "60ms" }}>
          <TarjetaKpiML 
            metricaPrincipal={{
              label: "En Riesgo Alto",
              valor: String(stats?.kpis?.riesgo_alto ?? "—"),
              subtexto: "prob. > 0.70",
              highlight: true
            }}
            metricaSecundaria={{
              label: "Días Promedio",
              valor: `${stats?.kpis?.promedio_dias_riesgo ?? "—"} días`,
              subtexto: "sin visita (en riesgo)"
            }}
            icono={Activity}
            color="#ef4444" 
          />

          <TarjetaKpiML 
            metricaPrincipal={{
              label: "Tasa de Retención",
              valor: stats?.kpis?.tasa_retencion ?? "—",
              subtexto: `sobre ${stats?.kpis?.total_pacientes ?? "—"} pacientes`,
              highlight: true
            }}
            metricaSecundaria={{
              label: "Recall del Modelo",
              valor: stats?.kpis?.recall_modelo ?? "90%",
              subtexto: "precisión de detección"
            }}
            icono={Brain}
            color="#1D9E75"
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2 animate-in-up" style={{ animationDelay: "120ms" }}>
          <GraficoSucursales data={stats?.sucursales} />
          <GraficoEspecies data={stats?.especies} />
        </div>

        {/* Tabla CRM */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg animate-in-up" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 rounded-full bg-[#1D9E75]" />
            <h2 className="text-base font-bold text-foreground">Panel de acción CRM</h2>
            <span className="text-xs text-muted-foreground ml-1">· pacientes en riesgo</span>
          </div>
          <TablaPacientes />
        </div>

      </div>
    </div>
  )
}
