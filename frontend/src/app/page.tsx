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
    <div className="flex min-h-screen w-full flex-col bg-[#0A0A0F] pattern-bg pt-16 relative overflow-x-hidden">

      {/* Background Glows Fijos */}
      <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#1D9E75]/15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Navbar Superior Fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-white/5 bg-[#0D0D12]/60 backdrop-blur-2xl px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#1D9E75] to-[#25C08F] shadow-[0_0_20px_rgba(29,158,117,0.3)] group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">
              VetSur <span className="text-[#1D9E75] opacity-50 font-medium">ML</span>
            </span>
          </Link>

          <Link
            href="/predictor"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#1D9E75] transition-all"
          >
            <Brain className="h-4 w-4" />
            Motor Predictor
            <ChevronRight className="h-3 w-3 opacity-30" />
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full space-y-12 p-6 lg:p-8 relative z-10">

        {/* KPI Cards Glassmorphic - Con isolation para evitar sangrado de hover */}
        <div className="grid gap-8 md:grid-cols-2 [isolation:isolate] relative z-10">
          <TarjetaKpiML
            metricaPrincipal={{
              label: "Pacientes en Riesgo",
              valor: String(stats?.kpis?.riesgo_alto ?? "—"),
              subtexto: "probabilidad > 70%",
              highlight: true
            }}
            metricaSecundaria={{
              label: "Días sin Visita",
              valor: `${stats?.kpis?.promedio_dias_riesgo ?? "—"} días`,
              subtexto: "promedio histórico"
            }}
            icono={Activity}
            color="#ef4444"
          />

          <TarjetaKpiML
            metricaPrincipal={{
              label: "Tasa de Retención",
              valor: stats?.kpis?.tasa_retencion ?? "—",
              subtexto: `analizando ${stats?.kpis?.total_pacientes ?? "—"} casos`,
              highlight: true
            }}
            metricaSecundaria={{
              label: "Precisión de IA",
              valor: stats?.kpis?.recall_modelo ?? "90%",
              subtexto: "modelo validado"
            }}
            icono={Brain}
            color="#1D9E75"
          />
        </div>

        {/* Gráficos Glassmorphic - Z-20 para estar por encima de cualquier sangrado inferior */}
        <div className="grid gap-8 md:grid-cols-2 relative z-20">
          <GraficoSucursales data={stats?.sucursales} />
          <GraficoEspecies data={stats?.especies} />
        </div>

        {/* Tabla CRM Glassmorphic */}
        <div className="bg-[#13141C]/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-10 shadow-2xl animate-in-up relative overflow-hidden" style={{ animationDelay: "180ms" }}>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#1D9E75]/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#1D9E75] to-transparent shadow-[0_0_15px_rgba(29,158,117,0.3)]" />
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-white tracking-tight">Panel de acción CRM</h2>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <TablaPacientes />
          </div>
        </div>

      </div>
    </div>
  )
}
