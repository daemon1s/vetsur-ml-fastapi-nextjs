"use client"
import React, { useState } from "react"
import Link from "next/link"
import { Activity, ChevronLeft, Stethoscope, BarChart3, Info, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GaugePrediccion } from "@/components/gauge-prediccion"
import { apiObj } from "@/lib/api"
import type { DatosPaciente, RespuestaPrediccion } from "@/types/vetsur"
import { Badge } from "@/components/ui/badge"

export default function PredictorPage() {
  const initialForm: DatosPaciente = {
    dias_desde_ultima_visita: 30,
    visitas_historicas: 3,
    monto_cobrado: 25000,
    costo_medicamento: 10000,
    tiene_vacunas_al_dia: false,
    edad_mascota_anios: 5,
    raza_registrada: false,
    especie: "Perro",
    sucursal: "Providencia",
    tipo_atencion: "Consulta general",
    diagnostico: "Control rutina"
  }

  const [formData, setFormData] = useState<DatosPaciente>(initialForm)
  const [useCustomAmounts, setUseCustomAmounts] = useState(false)

  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<RespuestaPrediccion | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiObj.predecirPaciente({
        ...formData,
        monto_cobrado: useCustomAmounts ? Number(formData.monto_cobrado) : 0,
        costo_medicamento: useCustomAmounts ? Number(formData.costo_medicamento) : 0,
        visitas_historicas: Math.max(1, Number(formData.visitas_historicas)),
        edad_mascota_anios: Number(formData.edad_mascota_anios),
        dias_desde_ultima_visita: Number(formData.dias_desde_ultima_visita)
      })
      setResultado(res)
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialForm)
    setResultado(null)
    setError(null)
  }

  const updateForm = (key: keyof DatosPaciente, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const colorRiesgo = (r: string) =>
    r === "Alto" ? "bg-destructive/20 text-destructive border-destructive/30" :
      r === "Medio" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
        "bg-[#1D9E75]/20 text-[#1D9E75] border-[#1D9E75]/30"

  // Estilos comunes para inputs
  const inputBase = "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50 transition-all font-medium"
  const selectBase = "flex h-11 w-full rounded-xl border border-white/10 bg-[#13141C] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50 appearance-none font-medium"

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0A0A0F] pattern-bg text-white relative overflow-x-hidden">

      {/* Background Glows Fijos */}
      <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#1D9E75]/15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Header Unificado */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-white/5 bg-[#0D0D12]/60 backdrop-blur-2xl px-4 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#1D9E75] to-[#25C08F] shadow-[0_0_20px_rgba(29,158,117,0.3)] group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">VetSur <span className="text-[#1D9E75] opacity-50 font-medium">ML</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-[#1D9E75] transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 lg:p-10 z-10">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Formulario */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                Predicción de riesgo
                <Sparkles className="h-6 w-6 text-[#1D9E75]" />
              </h1>
              <p className="text-muted-foreground font-medium">Motor de inteligencia artificial para la retención de pacientes.</p>
            </div>

            <Card className="bg-[#13141C]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">

                {/* Días - Slider Manual */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1D9E75] tracking-widest uppercase">Temporalidad</label>
                      <h3 className="text-sm font-semibold text-white/50">Días transcurridos</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={formData.dias_desde_ultima_visita}
                        onChange={(e) => updateForm("dias_desde_ultima_visita", Number(e.target.value))}
                        className="w-24 h-11 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-semibold text-[#1D9E75] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50"
                      />
                      <span className="text-xs font-semibold opacity-30 uppercase">Días</span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-white/5 rounded-full">
                    <input
                      type="range"
                      min="1"
                      max="730"
                      value={formData.dias_desde_ultima_visita}
                      onChange={(e) => updateForm("dias_desde_ultima_visita", Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1D9E75] to-[#25C08F] rounded-full shadow-[0_0_15px_rgba(29,158,117,0.4)]"
                      style={{ width: `${(formData.dias_desde_ultima_visita / 730) * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 size-5 bg-white border-4 border-[#1D9E75] rounded-full shadow-xl pointer-events-none"
                      style={{ left: `calc(${(formData.dias_desde_ultima_visita / 730) * 100}% - 10px)` }}
                    />
                  </div>
                  {formData.dias_desde_ultima_visita > 540 && (
                    <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                      ⚠️ Valor fuera del rango de entrenamiento (máx 540d)
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Especie</label>
                    <div className="relative">
                      <select
                        value={formData.especie}
                        onChange={(e) => updateForm("especie", e.target.value)}
                        className={selectBase}
                      >
                        {["Perro", "Gato", "Exótico", "Ave"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><ChevronLeft className="rotate-270 h-4 w-4" /></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Edad (Años)</label>
                    <input type="number" step="0.5" value={formData.edad_mascota_anios} onChange={(e) => updateForm("edad_mascota_anios", Number(e.target.value))} className={inputBase} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Visitas Totales</label>
                    <input type="number" value={formData.visitas_historicas} onChange={(e) => updateForm("visitas_historicas", Number(e.target.value))} className={inputBase} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold">Consumo de la última consulta</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">¿Deseas ingresar montos exactos?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={useCustomAmounts}
                        onChange={(e) => setUseCustomAmounts(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D9E75]"></div>
                    </label>
                  </div>

                  {useCustomAmounts ? (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Monto Cobrado (CLP)</label>
                        <input 
                          type="number" 
                          value={formData.monto_cobrado} 
                          onChange={(e) => updateForm("monto_cobrado", Number(e.target.value))} 
                          className={inputBase} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Costo Meds (CLP)</label>
                        <input 
                          type="number" 
                          value={formData.costo_medicamento} 
                          onChange={(e) => updateForm("costo_medicamento", Number(e.target.value))} 
                          className={inputBase} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#1D9E75]/5 border border-[#1D9E75]/20 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#1D9E75] animate-pulse" />
                      <p className="text-[10px] font-medium text-[#1D9E75] uppercase tracking-widest">
                        Utilizando promedios inteligentes (Mediana histórica)
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sucursal</label>
                    <select value={formData.sucursal} onChange={(e) => updateForm("sucursal", e.target.value)} className={selectBase}>
                      {["La Florida", "Las Condes", "Maipú", "Ñuñoa", "Peñalolén", "Providencia", "Pudahuel", "San Miguel"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Atención</label>
                      <select value={formData.tipo_atencion} onChange={(e) => updateForm("tipo_atencion", e.target.value)} className={selectBase}>
                        {["Cirugía", "Consulta especialidad", "Consulta general", "Hospitalización", "Venta producto"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Diagnóstico</label>
                      <select value={formData.diagnostico} onChange={(e) => updateForm("diagnostico", e.target.value)} className={selectBase}>
                        {[
                          "Control rutina", "Control rutina C",
                          "Artritis", "Artritis C",
                          "Dermatitis", "Dermatitis C",
                          "Diabetes", "Diabetes C",
                          "Esterilización", "Esterilización C",
                          "Fractura", "Fractura C",
                          "Gastroenteritis", "Gastroenteritis C",
                          "Otitis", "Otitis C",
                          "Parvovirus", "Parvovirus C",
                          "Tumor", "Tumor C"
                        ].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="space-y-1">
                      <span className="text-sm font-semibold block">Vacunas al día</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Historial clínico</span>
                    </div>
                    <input type="checkbox" checked={formData.tiene_vacunas_al_dia} onChange={(e) => updateForm("tiene_vacunas_al_dia", e.target.checked)} className="size-6 rounded-lg accent-[#1D9E75] cursor-pointer" />
                  </label>
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="space-y-1">
                      <span className="text-sm font-semibold block">Mascota de raza</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Identificación</span>
                    </div>
                    <input type="checkbox" checked={formData.raza_registrada} onChange={(e) => updateForm("raza_registrada", e.target.checked)} className="size-6 rounded-lg accent-[#1D9E75] cursor-pointer" />
                  </label>
                </div>

                <Button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full h-16 bg-gradient-to-r from-[#1D9E75] to-[#25C08F] hover:shadow-[0_0_30px_rgba(29,158,117,0.5)] text-white text-base font-semibold tracking-wide rounded-2xl transition-all active:scale-[0.98] shadow-lg"
                >
                  {loading ? "Procesando perfil..." : "Ejecutar predicción"}
                </Button>
                {error && <p className="text-center text-xs text-destructive font-bold uppercase tracking-widest">⚠️ {error}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Resultado */}
          <div className="lg:col-span-5 sticky top-24">
            {resultado ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <Card className="bg-[#13141C]/80 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px] p-10 relative overflow-hidden border-t-white/20">
                  <div className={`absolute top-0 left-0 w-full h-2 ${resultado.nivel_riesgo === 'Alto' ? 'bg-red-500' : 'bg-[#1D9E75]'}`} />
                  <div className="text-center space-y-8">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Análisis de retención</h2>
                    <GaugePrediccion probabilidad={resultado.probabilidad_retorno} riesgo={resultado.nivel_riesgo} />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-white/5 p-5 rounded-3xl border border-white/5">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1D9E75]">Prob. abandono</span>
                        <Badge className={`text-sm px-6 py-1.5 font-semibold uppercase tracking-widest border-none ${colorRiesgo(resultado.nivel_riesgo)}`}>
                          {resultado.nivel_riesgo}
                        </Badge>
                      </div>

                      <div className="text-left bg-[#1D9E75]/5 p-6 rounded-3xl border border-[#1D9E75]/20 space-y-3">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-[#1D9E75]" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1D9E75]">Estrategia sugerida</span>
                        </div>
                        <p className="text-base text-white/90 font-medium leading-relaxed italic">
                          "{resultado.accion_sugerida}"
                        </p>
                      </div>

                      <Button variant="ghost" onClick={handleReset} className="text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest">
                        Reestablecer Parámetros
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[40px] min-h-[600px] text-center p-10 border-dashed backdrop-blur-sm">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-[#1D9E75] blur-[80px] opacity-20" />
                  <div className="p-10 rounded-full bg-white/5 border border-white/5 relative">
                    <BarChart3 className="h-16 w-16 text-[#1D9E75] opacity-50" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Motor de Inferencia</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[280px]">
                  El sistema está listo para procesar el perfil clínico del paciente.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
