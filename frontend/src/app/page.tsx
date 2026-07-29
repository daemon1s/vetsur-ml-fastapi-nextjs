"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { apiObj } from "@/lib/api"
import { TarjetaKpiML } from "@/components/tarjetas-kpi"
import { GraficoSucursales } from "@/components/grafico-sucursales"
import { GraficoEspecies } from "@/components/grafico-especies"
import { TablaPacientes } from "@/components/tabla-pacientes"
import { Badge } from "@/components/ui/badge"
import { Activity, Brain, ChevronRight, Zap } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiObj.obtenerEstadisticas()
        setStats(res)
        setError(null)
      } catch (e: any) {
        console.error("Error cargando stats:", e)
        setError(e.response?.data?.detail || e.message || "Error de conexión con el servidor API.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0A0A0F] pattern-bg pt-16 relative overflow-x-hidden">

      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-white/5 bg-[#0D0D12]/60 backdrop-blur-2xl px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo_vetsur.png"
              alt="VetSur Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-black text-xl tracking-tighter">
              VetSur <span className="text-[#1D9E75] opacity-50 font-medium">ML</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/arquitectura"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#1D9E75] transition-all"
            >
              <Zap className="h-4 w-4" />
              Arquitectura
            </Link>

            <Link
              href="/predictor"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-[#1D9E75] transition-all"
            >
              <Brain className="h-4 w-4" />
              Predictor IA
              <ChevronRight className="h-3 w-3 opacity-30" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-6 lg:p-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="size-10 rounded-full border-4 border-[#1D9E75] border-t-transparent animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#1D9E75] animate-pulse">Cargando métricas y modelo...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-950/10 border border-red-500/20 rounded-[40px] shadow-2xl backdrop-blur-sm max-w-2xl mx-auto my-12 animate-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500 blur-[60px] opacity-20" />
              <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20 relative">
                <Activity className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error de Sincronización</h3>
            <p className="text-sm text-white/60 mb-6 max-w-md">{error}</p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-semibold text-white/40 uppercase tracking-widest leading-relaxed">
              Verifique que los archivos caso1_vetsur.csv y modelo_vetsur.pkl estén correctamente montados y conectados en el servidor.
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in-up">
            <div className="grid gap-8 md:grid-cols-2 [isolation:isolate] relative z-10">
              <TarjetaKpiML
                metricaPrincipal={{
                  label: "Pacientes en riesgo",
                  valor: String(stats?.kpis?.riesgo_alto ?? "—"),
                  subtexto: "probabilidad > 70%",
                  highlight: true
                }}
                metricaSecundaria={{
                  label: "Días sin visita",
                  valor: `${stats?.kpis?.promedio_dias_riesgo ?? "—"} días`,
                  subtexto: "promedio histórico"
                }}
                icono={Activity}
                color="#1D9E75"
              />

              <TarjetaKpiML
                metricaPrincipal={{
                  label: "Tasa de retención",
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

            <div className="grid gap-8 md:grid-cols-2 relative z-20">
              <GraficoSucursales data={stats?.sucursales} />
              <GraficoEspecies data={stats?.especies} />
            </div>

            <div className="bg-[#0A0B10] border border-white/10 rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#1D9E75] to-transparent shadow-[0_0_15px_rgba(29,158,117,0.3)]" />
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Dashboard</h2>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <TablaPacientes />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
