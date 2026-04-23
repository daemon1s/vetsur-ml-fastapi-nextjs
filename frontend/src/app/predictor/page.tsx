"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GaugePrediccion } from "@/components/gauge-prediccion"
import { apiObj } from "@/lib/api"
import type { DatosPaciente, RespuestaPrediccion } from "@/types/vetsur"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Stethoscope, BarChart3 } from "lucide-react"

export default function PredictorPage() {
  const [formData, setFormData] = useState<Partial<DatosPaciente>>({
    dias_desde_ultima_visita: 30,
    visitas_historicas: 3,
    monto_cobrado: 25000,
    costo_medicamento: 10000,
    tiene_vacunas_al_dia: true,
    edad_mascota_anios: 5,
    raza_registrada: true,
    especie: "Perro",
    sucursal: "Providencia",
    tipo_atencion: "Consulta general",
    diagnostico: "Control rutina"
  })

  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<RespuestaPrediccion | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const res = await apiObj.predecirPaciente(formData as DatosPaciente)
      setResultado(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (key: keyof DatosPaciente, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const colorRiesgo = (r: string) =>
    r === "Alto" ? "bg-destructive/15 text-destructive border-destructive/30" :
    r === "Medio" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
    "bg-[#1D9E75]/15 text-[#1D9E75] border-[#1D9E75]/30"

  return (
    <div className="flex min-h-screen w-full flex-col bg-background pattern-bg">

      {/* Navbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-6">
        <Link href="/" className="flex items-center gap-2 font-black text-lg text-foreground hover:text-[#1D9E75] transition-colors">
          <Activity className="h-5 w-5 text-[#1D9E75]" />
          VetSur
        </Link>
        <div className="h-4 w-px bg-border mx-1" />
        <span className="text-muted-foreground text-sm flex items-center gap-1.5">
          <Stethoscope className="h-3.5 w-3.5" />
          Predictor de retención
        </span>
        <div className="ml-auto">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#1D9E75] transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
            Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-8 flex items-start justify-center">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6 animate-in-up">

          {/* Formulario */}
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-[#1D9E75]" />
                Datos del paciente
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Ingresa los datos para predecir si el paciente volverá en los próximos 90 días.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Días desde última visita · <span className="text-[#1D9E75]">{formData.dias_desde_ultima_visita}</span>
                </label>
                <Slider
                  max={540}
                  step={1}
                  value={[formData.dias_desde_ultima_visita || 0]}
                  onValueChange={(val) => updateForm("dias_desde_ultima_visita", val[0])}
                  className="py-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visitas históricas</label>
                  <Input type="number" value={formData.visitas_historicas} onChange={(e) => updateForm("visitas_historicas", parseInt(e.target.value) || 0)} className="bg-secondary border-border" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto cobrado ($)</label>
                  <Input type="number" value={formData.monto_cobrado} onChange={(e) => updateForm("monto_cobrado", parseInt(e.target.value) || 0)} className="bg-secondary border-border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2.5">
                  <label className="text-xs font-semibold text-muted-foreground">Vacunas al día</label>
                  <Switch checked={formData.tiene_vacunas_al_dia} onCheckedChange={(val) => updateForm("tiene_vacunas_al_dia", val)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2.5">
                  <label className="text-xs font-semibold text-muted-foreground">Raza registrada</label>
                  <Switch checked={formData.raza_registrada} onCheckedChange={(val) => updateForm("raza_registrada", val)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sucursal</label>
                <Select value={formData.sucursal} onValueChange={(val) => updateForm("sucursal", val)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecciona sucursal" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["La Florida", "Las Condes", "Maipú", "Ñuñoa", "Peñalolén", "Providencia", "Pudahuel", "San Miguel"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Especie</label>
                  <Select value={formData.especie} onValueChange={(val) => updateForm("especie", val)}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {["Perro", "Gato", "Exótico", "Ave"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo atención</label>
                  <Select value={formData.tipo_atencion} onValueChange={(val) => updateForm("tipo_atencion", val)}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {["Consulta especialidad", "Consulta general", "Hospitalización", "Venta producto"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-[#1D9E75] hover:bg-[#15805e] text-white font-bold h-11 shadow-lg glow-green transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Analizando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Predecir retorno
                  </span>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Resultado */}
          {resultado ? (
            <Card className="bg-card border-border shadow-lg animate-in-up">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#1D9E75]" />
                  Resultado de predicción
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-6">
                <GaugePrediccion probabilidad={resultado.probabilidad_retorno} riesgo={resultado.nivel_riesgo} />

                <div className="mt-6 w-full space-y-3 rounded-xl bg-secondary border border-border p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nivel de riesgo</span>
                    <Badge className={`text-xs px-3 py-0.5 font-bold border ${colorRiesgo(resultado.nivel_riesgo)}`}>
                      {resultado.nivel_riesgo}
                    </Badge>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Acción CRM sugerida</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{resultado.accion_sugerida}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center border border-dashed border-border rounded-2xl min-h-[400px] text-muted-foreground bg-card/40">
              <div className="text-center space-y-3">
                <div className="p-4 rounded-full bg-secondary mx-auto w-fit">
                  <BarChart3 className="h-8 w-8 opacity-30" />
                </div>
                <p className="text-sm font-medium">Completa los datos para ver el resultado</p>
                <p className="text-xs text-muted-foreground">El modelo analizará el riesgo de abandono</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
