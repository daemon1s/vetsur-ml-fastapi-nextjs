"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Activity,
  ChevronLeft,
  MessageSquare,
  RotateCcw,
  Calendar,
  Building2,
  PawPrint,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GaugePrediccion } from "@/components/gauge-prediccion"
import { DesgloseFactores } from "@/components/desglose-factores"
import { ErrorPanel, VacioPanel } from "@/components/estados"
import { apiObj } from "@/lib/api"
import { presetsPredictor as presets } from "@/lib/presets-predictor"
import type {
  DatosPaciente,
  RespuestaPrediccion,
  TipoEspecie,
  TipoSucursal,
  TipoAtencion,
  TipoDiagnostico,
} from "@/types/vetsur"

const initialForm: DatosPaciente = {
  dias_desde_ultima_visita: 45,
  visitas_historicas: 3,
  monto_cobrado: 25000,
  costo_medicamento: 10000,
  tiene_vacunas_al_dia: true,
  edad_mascota_anios: 4,
  raza_registrada: true,
  especie: "Perro",
  sucursal: "Las Condes",
  tipo_atencion: "Consulta general",
  diagnostico: "Control rutina",
}

function PredictorPageContent() {
  const [formData, setFormData] = useState<DatosPaciente>(initialForm)
  const [usarMontosManuales, setUsarMontosManuales] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<RespuestaPrediccion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const ejecutarPrediccion = async (datosParaEnviar: DatosPaciente = formData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiObj.predecirPaciente({
        ...datosParaEnviar,
        monto_cobrado: usarMontosManuales ? Number(datosParaEnviar.monto_cobrado) : 0,
        costo_medicamento: usarMontosManuales ? Number(datosParaEnviar.costo_medicamento) : 0,
        visitas_historicas: Math.max(1, Number(datosParaEnviar.visitas_historicas)),
        edad_mascota_anios: Number(datosParaEnviar.edad_mascota_anios),
        dias_desde_ultima_visita: Number(datosParaEnviar.dias_desde_ultima_visita),
      })
      setResultado(res)
    } catch {
      setError("No se pudo evaluar el paciente. Verificá que la API esté disponible e intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ejecutarPrediccion(initialForm)
  }, [])

  const actualizarCampo = (campo: keyof DatosPaciente, valor: DatosPaciente[keyof DatosPaciente]) => {
    const nuevosDatos = { ...formData, [campo]: valor }
    setFormData(nuevosDatos)
  }

  const aplicarPreset = (datosPreset: DatosPaciente) => {
    setFormData(datosPreset)
    ejecutarPrediccion(datosPreset)
  }

  const restablecerFormulario = () => {
    setFormData(initialForm)
    setUsarMontosManuales(false)
    ejecutarPrediccion(initialForm)
  }

  const copiarAccion = () => {
    if (resultado?.accion_sugerida) {
      navigator.clipboard.writeText(resultado.accion_sugerida)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const probabilidadAbandonoActual = resultado
    ? (resultado.probabilidad_abandono !== undefined
        ? resultado.probabilidad_abandono
        : Number((1 - resultado.probabilidad_retorno).toFixed(3)))
    : 0

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, le escribimos desde la Clínica VetSur (${formData.sucursal}) para consultar por el estado de su ${formData.especie.toLowerCase()} y coordinar su próximo control preventivo.`
  )
  const enlaceWhatsApp = `https://wa.me/?text=${mensajeWhatsApp}`

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
              Predictor individual de pacientes
            </h1>
          </div>

          <button
            onClick={restablecerFormulario}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-0 space-y-6">
        <div className="rounded-xl border border-slate-800 bg-[#131d2e] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400">Casos de ejemplo para probar el predictor</span>
            <div className="flex flex-wrap items-center gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.titulo}
                  type="button"
                  onClick={() => aplicarPreset(preset.datos)}
                  className="rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                >
                  {preset.titulo}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16a085]/15 text-[#16a085]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">
                      1. Datos de la atención clínica
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Sede, tipo de consulta médica y diagnóstico efectuado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Sucursal</label>
                    <select
                      value={formData.sucursal}
                      onChange={(e) => actualizarCampo("sucursal", e.target.value as TipoSucursal)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-[#16a085] focus:outline-none"
                    >
                      <option value="Las Condes">Las Condes</option>
                      <option value="Providencia">Providencia</option>
                      <option value="Ñuñoa">Ñuñoa</option>
                      <option value="Maipú">Maipú</option>
                      <option value="La Florida">La Florida</option>
                      <option value="Peñalolén">Peñalolén</option>
                      <option value="San Miguel">San Miguel</option>
                      <option value="Pudahuel">Pudahuel</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Tipo de atención</label>
                    <select
                      value={formData.tipo_atencion}
                      onChange={(e) => actualizarCampo("tipo_atencion", e.target.value as TipoAtencion)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-[#16a085] focus:outline-none"
                    >
                      <option value="Consulta general">Consulta general</option>
                      <option value="Consulta especialidad">Consulta especialidad</option>
                      <option value="Cirugía">Cirugía</option>
                      <option value="Hospitalización">Hospitalización</option>
                      <option value="Venta producto">Venta producto</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Diagnóstico</label>
                    <select
                      value={formData.diagnostico}
                      onChange={(e) => actualizarCampo("diagnostico", e.target.value as TipoDiagnostico)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-[#16a085] focus:outline-none"
                    >
                      <option value="Control rutina">Control rutina</option>
                      <option value="Artritis">Artritis</option>
                      <option value="Dermatitis">Dermatitis</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Esterilización">Esterilización</option>
                      <option value="Fractura">Fractura</option>
                      <option value="Gastroenteritis">Gastroenteritis</option>
                      <option value="Otitis">Otitis</option>
                      <option value="Parvovirus">Parvovirus</option>
                      <option value="Tumor">Tumor</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3498db]/15 text-[#3498db]">
                    <PawPrint className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">
                      2. Datos clínicos del paciente
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Especie, edad y estado preventivo registrado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Especie</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["Perro", "Gato", "Exótico", "Ave"] as TipoEspecie[]).map((esp) => (
                        <button
                          key={esp}
                          type="button"
                          onClick={() => actualizarCampo("especie", esp)}
                          className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                            formData.especie === esp
                              ? "border-[#16a085] bg-[#16a085]/20 text-[#16a085]"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          {esp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-300">Edad de la mascota</label>
                      <span className="text-xs font-mono font-bold text-[#16a085]">
                        {formData.edad_mascota_anios} años
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0.1"
                      max="30"
                      step="0.5"
                      value={formData.edad_mascota_anios}
                      onChange={(e) => actualizarCampo("edad_mascota_anios", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-[#16a085] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                  <div
                    onClick={() => actualizarCampo("tiene_vacunas_al_dia", !formData.tiene_vacunas_al_dia)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.tiene_vacunas_al_dia
                        ? "border-emerald-500/50 bg-emerald-950/20"
                        : "border-slate-700 bg-slate-900/60"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">
                        Vacunas al día
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {formData.tiene_vacunas_al_dia ? "Esquema vigente" : "Vacunas vencidas"}
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.tiene_vacunas_al_dia ? "bg-[#16a085]" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.tiene_vacunas_al_dia ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    onClick={() => actualizarCampo("raza_registrada", !formData.raza_registrada)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.raza_registrada
                        ? "border-slate-600 bg-slate-800/60"
                        : "border-slate-700 bg-slate-900/60"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">
                        Raza registrada
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {formData.raza_registrada ? "Raza pura o identificada" : "Mestizo / no registrada"}
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.raza_registrada ? "bg-[#3498db]" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.raza_registrada ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-[#3498db]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">
                      3. Historial de visitas e inactividad
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Días desde la última atención y frecuencia acumulada
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block">
                        Días desde la última visita
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {formData.dias_desde_ultima_visita > 90
                          ? "Ventana de alto riesgo (> 90 días)"
                          : formData.dias_desde_ultima_visita >= 30
                          ? "Ventana preventiva (30 a 90 días)"
                          : "Paciente activo (< 30 días)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="540"
                        value={formData.dias_desde_ultima_visita}
                        onChange={(e) => actualizarCampo("dias_desde_ultima_visita", Number(e.target.value))}
                        className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-center font-mono text-sm font-bold text-[#16a085] focus:outline-none focus:border-[#16a085]"
                      />
                      <span className="text-xs font-semibold text-slate-400">días</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <input
                      type="range"
                      min="1"
                      max="365"
                      value={formData.dias_desde_ultima_visita}
                      onChange={(e) => actualizarCampo("dias_desde_ultima_visita", Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-900 accent-[#16a085]"
                    />
                    <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1">
                      <span>1 día</span>
                      <span>30 días (Preventivo)</span>
                      <span>90 días (Riesgo)</span>
                      <span>365 días</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Visitas históricas previas</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.visitas_historicas}
                      onChange={(e) => actualizarCampo("visitas_historicas", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 focus:border-[#16a085] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Montos de atención</label>
                      <button
                        type="button"
                        onClick={() => setUsarMontosManuales(!usarMontosManuales)}
                        className="text-[11px] font-semibold text-[#16a085] hover:underline"
                      >
                        {usarMontosManuales ? "Usar mediana automática" : "Ingresar montos exactos"}
                      </button>
                    </div>
                    {usarMontosManuales ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Monto CLP"
                          value={formData.monto_cobrado}
                          onChange={(e) => actualizarCampo("monto_cobrado", Number(e.target.value))}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Costo med. CLP"
                          value={formData.costo_medicamento}
                          onChange={(e) => actualizarCampo("costo_medicamento", Number(e.target.value))}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                        Cálculo con mediana histórica de la red
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => ejecutarPrediccion()}
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#16a085] hover:bg-[#138d75] text-white font-semibold text-sm transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Evaluando el riesgo del paciente...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Calcular riesgo del paciente</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-white">
                      Resultado del modelo
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Evaluación de retención y riesgo de fuga
                    </CardDescription>
                  </div>
                  {resultado && (
                    <Badge
                      className={`text-xs px-3 py-1 font-bold ${
                        resultado.nivel_riesgo === "Alto"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          : resultado.nivel_riesgo === "Medio"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      Riesgo {resultado.nivel_riesgo}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {error ? (
                  <ErrorPanel mensaje={error} onReintentar={() => ejecutarPrediccion()} />
                ) : !resultado ? (
                  <VacioPanel
                    titulo="Sin resultado todavía"
                    detalle="Evaluá un paciente para ver su probabilidad de abandono y la acción sugerida."
                  />
                ) : (
                  <>
                <GaugePrediccion
                  probabilidadAbandono={probabilidadAbandonoActual}
                  nivelRiesgo={resultado.nivel_riesgo}
                />

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Acción recomendada para el equipo
                    </span>
                    <button
                      type="button"
                      onClick={copiarAccion}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                    >
                      {copiado ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiado ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    &ldquo;{resultado.accion_sugerida}&rdquo;
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={enlaceWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-semibold transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Contactar cliente por WhatsApp</span>
                    </a>
                  </div>
                </div>
                  </>
                )}
              </CardContent>
            </Card>

            {resultado && (
              <DesgloseFactores
                datos={formData}
                nivelRiesgo={resultado.nivel_riesgo}
                probabilidadAbandono={probabilidadAbandonoActual}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PredictorPage() {
  return <PredictorPageContent />
}
