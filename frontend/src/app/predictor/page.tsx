"use client"
import React, { useState } from "react"
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
      // MOCK FALLBACK SI BBDD / FASTAPI NO ESTÁ ACTIVO AÚN LOCALMENTE MIENTRAS RODRIGO TESTEA
      const probMock = Math.min(0.99, (formData.dias_desde_ultima_visita || 0) / 100.0)
      const riesgo = probMock > 0.7 ? "Alto" : probMock > 0.4 ? "Medio" : "Bajo"
      setResultado({
        probabilidad_retorno: probMock,
        prediccion_clase: probMock > 0.5 ? 1 : 0,
        nivel_riesgo: riesgo,
        accion_sugerida: riesgo === "Alto" ? "Contactar urgente por WhatsApp" : "Acción regular configurada."
      })
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (key: keyof DatosPaciente, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#1D9E75] tracking-tight hover:opacity-80">
          <Activity className="h-6 w-6" />
          VetSur
        </Link>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Link href="/" className="text-sm font-medium hover:text-[#1D9E75] transition-colors ml-auto">
            Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 p-8 flex items-start justify-center pattern-bg">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
          
          <Card className="shadow-lg border-t-4 border-t-[#1D9E75]">
            <CardHeader className="bg-slate-50/50 pb-4">
              <CardTitle className="text-2xl">Nuevo análisis</CardTitle>
              <CardDescription>
                Ingresa los datos para predecir si el paciente volverá en los próximos 90 días.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Días desde última visita ({formData.dias_desde_ultima_visita})</label>
                <Slider 
                  max={540} 
                  step={1} 
                  value={[formData.dias_desde_ultima_visita || 0]} 
                  onValueChange={(val) => updateForm("dias_desde_ultima_visita", val[0])} 
                  className="py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visitas históricas</label>
                  <Input type="number" value={formData.visitas_historicas} onChange={(e) => updateForm("visitas_historicas", parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto cobrado ($)</label>
                  <Input type="number" value={formData.monto_cobrado} onChange={(e) => updateForm("monto_cobrado", parseInt(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2 flex flex-col justify-center">
                    <label className="text-sm font-medium mb-2">Vacunas al día</label>
                    <Switch checked={formData.tiene_vacunas_al_dia} onCheckedChange={(val) => updateForm("tiene_vacunas_al_dia", val)} />
                 </div>
                 <div className="space-y-2 flex flex-col justify-center">
                    <label className="text-sm font-medium mb-2">Tiene raza</label>
                    <Switch checked={formData.raza_registrada} onCheckedChange={(val) => updateForm("raza_registrada", val)} />
                 </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">Sucursal</label>
                  <Select value={formData.sucursal} onValueChange={(val) => updateForm("sucursal", val)}>
                    <SelectTrigger><SelectValue placeholder="Seleccione sucursal" /></SelectTrigger>
                    <SelectContent>
                      {["La Florida", "Las Condes", "Maipú", "Ñuñoa", "Peñalolén", "Providencia", "Pudahuel", "San Miguel"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Especie</label>
                    <Select value={formData.especie} onValueChange={(val) => updateForm("especie", val)}>
                      <SelectTrigger><SelectValue placeholder="Especie" /></SelectTrigger>
                      <SelectContent>
                        {["Perro", "Gato", "Exótico", "Ave"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo atención</label>
                    <Select value={formData.tipo_atencion} onValueChange={(val) => updateForm("tipo_atencion", val)}>
                      <SelectTrigger><SelectValue placeholder="Atención" /></SelectTrigger>
                      <SelectContent>
                        {["Consulta especialidad", "Consulta general", "Hospitalización", "Venta producto"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
              </div>

              <Button 
                onClick={handlePredict} 
                disabled={loading}
                className="w-full bg-[#1D9E75] hover:bg-[#15805e] text-white shadow-md font-semibold h-12"
              >
                {loading ? "Analizando..." : "Predecir retorno"}
              </Button>

            </CardContent>
          </Card>

          {resultado ? (
             <Card className="shadow-lg border-none bg-white">
                <CardHeader className="text-center pb-0 border-b pb-4 mb-4">
                  <CardTitle>Resultado de predicción</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <GaugePrediccion probabilidad={resultado.probabilidad_retorno} riesgo={resultado.nivel_riesgo} />
                  
                  <div className="mt-8 text-center space-y-4 max-w-sm rounded-lg bg-slate-50 p-6 border shadow-sm">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-700">Nivel de riesgo</h3>
                      <Badge className={`mt-2 text-md px-4 py-1 text-white ${resultado.nivel_riesgo === 'Alto' ? 'bg-[#E24B4A]' : resultado.nivel_riesgo === 'Medio' ? 'bg-[#BA7517]' : 'bg-[#1D9E75]'}`}>
                        {resultado.nivel_riesgo}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 text-sm">Dictamen para Rodrigo</h3>
                      <p className="mt-2 text-sm text-slate-600 font-medium">
                        {resultado.accion_sugerida}
                      </p>
                    </div>
                  </div>
                </CardContent>
             </Card>
          ) : (
            <div className="flex items-center justify-center border-2 border-dashed rounded-xl h-full min-h-[400px] text-muted-foreground bg-slate-50/50">
              <div className="text-center space-y-2">
                <Activity className="h-10 w-10 mx-auto opacity-20" />
                <p>Completa los datos para ver el resultado.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
