"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Play,
  RotateCcw,
  Check,
  X,
  Activity,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { ErrorPanel, VacioPanel, Skeleton } from "@/components/estados"
import { GraficoCurvaRoc } from "@/components/grafico-curva-roc"
import { GraficoMatrizConfusion } from "@/components/grafico-matriz-confusion"
import { GraficoImportancia } from "@/components/grafico-importancia"
import { apiClient } from "@/lib/api"
import { presetsPredictor } from "@/lib/presets-predictor"
import type { EvaluacionModelo } from "@/types/diagnostico"
import type { DatosPaciente, RespuestaPrediccion, NivelRiesgo } from "@/types/vetsur"

type EstadoConsulta = "cargando" | "ok" | "error"

interface CheckInvariantes {
  sumaProbabilidades: boolean
  nivelCoherente: boolean
  accionNoVacia: boolean
}

interface ResultadoCaso {
  titulo: string
  resultadoEsperado: NivelRiesgo
  inputsClave: string
  datosCompletos: DatosPaciente
  respuesta: RespuestaPrediccion
  probabilidadAbandono: number
  checks: CheckInvariantes
}

const TOLERANCIA_SUMA = 0.01

function probabilidadAbandonoEfectiva(respuesta: RespuestaPrediccion): number {
  return respuesta.probabilidad_abandono !== undefined
    ? respuesta.probabilidad_abandono
    : Number((1 - respuesta.probabilidad_retorno).toFixed(3))
}

function nivelCoherenteConProbabilidad(nivel: NivelRiesgo, probabilidad: number): boolean {
  if (nivel === "Alto") return probabilidad >= 0.65
  if (nivel === "Medio") return probabilidad >= 0.3 && probabilidad < 0.65
  return probabilidad < 0.3
}

function chequearInvariantes(respuesta: RespuestaPrediccion): CheckInvariantes {
  const probabilidadAbandono = probabilidadAbandonoEfectiva(respuesta)
  return {
    sumaProbabilidades:
      Math.abs(respuesta.probabilidad_retorno + probabilidadAbandono - 1) <= TOLERANCIA_SUMA,
    nivelCoherente: nivelCoherenteConProbabilidad(respuesta.nivel_riesgo, probabilidadAbandono),
    accionNoVacia: respuesta.accion_sugerida.trim().length > 0,
  }
}

function describirInputsClave(datos: DatosPaciente): string {
  return `${datos.especie} · ${datos.dias_desde_ultima_visita} días sin visita · ${datos.visitas_historicas} visitas · ${
    datos.tiene_vacunas_al_dia ? "vacunas al día" : "sin vacunas"
  }`
}

const claseNivel = (nivel: NivelRiesgo) =>
  nivel === "Alto"
    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
    : nivel === "Medio"
    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"

const aPct = (valor: number) => `${(valor * 100).toFixed(1)}%`

export default function DiagnosticoPage() {
  const [estadoSalud, setEstadoSalud] = useState<EstadoConsulta>("cargando")
  const [salud, setSalud] = useState<{ status: string; modelo_listo: boolean } | null>(null)
  const [latenciaMs, setLatenciaMs] = useState<number | null>(null)
  const [estadoEvaluacion, setEstadoEvaluacion] = useState<EstadoConsulta>("cargando")
  const [evaluacion, setEvaluacion] = useState<EvaluacionModelo | null>(null)
  const [resultados, setResultados] = useState<ResultadoCaso[] | null>(null)
  const [corriendo, setCorriendo] = useState(false)
  const [errorPruebas, setErrorPruebas] = useState<string | null>(null)
  const [casoDetalleAbierto, setCasoDetalleAbierto] = useState<string | null>(null)

  const verificarSalud = useCallback(async () => {
    setEstadoSalud("cargando")
    const inicio = performance.now()
    try {
      const res = await apiClient.get<{ status: string; modelo_listo: boolean }>("/salud")
      setLatenciaMs(performance.now() - inicio)
      setSalud(res.data)
      setEstadoSalud("ok")
    } catch {
      setEstadoSalud("error")
    }
  }, [])

  const cargarEvaluacion = useCallback(async () => {
    setEstadoEvaluacion("cargando")
    try {
      const res = await apiClient.get<EvaluacionModelo>("/evaluar-modelo")
      setEvaluacion(res.data)
      setEstadoEvaluacion("ok")
    } catch {
      setEstadoEvaluacion("error")
    }
  }, [])

  useEffect(() => {
    verificarSalud()
  }, [verificarSalud])

  useEffect(() => {
    cargarEvaluacion()
  }, [cargarEvaluacion])

  const ejecutarPruebas = useCallback(async () => {
    setCorriendo(true)
    setErrorPruebas(null)
    try {
      const respuestas = await Promise.all(
        presetsPredictor.map((preset) => apiClient.post<RespuestaPrediccion>("/predecir", preset.datos))
      )
      setResultados(
        presetsPredictor.map((preset, indice) => ({
          titulo: preset.titulo,
          resultadoEsperado: preset.resultado_esperado,
          inputsClave: describirInputsClave(preset.datos),
          datosCompletos: preset.datos,
          respuesta: respuestas[indice].data,
          probabilidadAbandono: probabilidadAbandonoEfectiva(respuestas[indice].data),
          checks: chequearInvariantes(respuestas[indice].data),
        }))
      )
    } catch {
      setErrorPruebas(
        "No se pudieron ejecutar las pruebas. Verificá que la API esté disponible e intentá de nuevo."
      )
    } finally {
      setCorriendo(false)
    }
  }, [])

  const enLinea = salud?.status === "operativo"

  const matriz = evaluacion?.matriz_confusion
  const fugasReales = matriz ? matriz.falsos_negativos + matriz.verdaderos_positivos : 0
  const fprOperacion = matriz ? matriz.falsos_positivos / (matriz.falsos_positivos + matriz.verdaderos_negativos) : 0
  const tprOperacion = matriz && fugasReales > 0 ? matriz.verdaderos_positivos / fugasReales : 0

  const todosLosChecksPasan =
    resultados &&
    resultados.every(
      (r) => r.checks.sumaProbabilidades && r.checks.nivelCoherente && r.checks.accionNoVacia
    )

  return (
    <div className="min-h-screen bg-[#0b1320] text-slate-100 antialiased pb-16">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Cabecera de Página con Telemetría Integrada (sin divisor de fondo) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Diagnóstico del Sistema ML</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluación continua, calibración ROC y regresión funcional sobre el modelo en producción
            </p>
          </div>

          {/* Telemetría del Backend */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 shadow-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  enLinea ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-rose-400"
                }`}
              />
              <span className="font-semibold text-slate-200">{enLinea ? "API Online" : "Offline"}</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">
                {latenciaMs !== null ? `${latenciaMs.toFixed(0)} ms` : "—"}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                Modelo:{" "}
                <span className={salud?.modelo_listo ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                  {salud?.modelo_listo ? "Listo" : "No listo"}
                </span>
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                verificarSalud()
                cargarEvaluacion()
              }}
              disabled={estadoSalud === "cargando" || estadoEvaluacion === "cargando"}
              className="h-9 px-3 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:text-white rounded-xl"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {/* Fila: Curva ROC y Matriz de Confusión */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Tarjeta Curva ROC */}
          <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16a085]/15 text-[#16a085]">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">Curva ROC (Discriminación)</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Capacidad de detección de fugas vs. falsas alarmas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {estadoEvaluacion === "cargando" ? (
                <Skeleton className="h-64 w-full" />
              ) : estadoEvaluacion === "error" ? (
                <ErrorPanel mensaje="No se pudo cargar la curva ROC." onReintentar={cargarEvaluacion} />
              ) : evaluacion ? (
                <GraficoCurvaRoc
                  curva={evaluacion.curva_roc}
                  fprOperacion={fprOperacion}
                  tprOperacion={tprOperacion}
                  aucRoc={evaluacion.metricas.auc_roc}
                />
              ) : null}
            </CardContent>
          </Card>

          {/* Tarjeta Matriz de Confusión */}
          <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e74c3c]/15 text-[#e74c3c]">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">Matriz de Confusión 2×2</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Aciertos y errores clínicos del modelo en pacientes de prueba
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {estadoEvaluacion === "cargando" ? (
                <Skeleton className="h-64 w-full" />
              ) : estadoEvaluacion === "error" ? (
                <ErrorPanel mensaje="No se pudo cargar la matriz de confusión." onReintentar={cargarEvaluacion} />
              ) : matriz ? (
                <GraficoMatrizConfusion
                  verdaderosNegativos={matriz.verdaderos_negativos}
                  falsosPositivos={matriz.falsos_positivos}
                  falsosNegativos={matriz.falsos_negativos}
                  verdaderosPositivos={matriz.verdaderos_positivos}
                  filasTest={evaluacion.dataset.filas_test}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Importancia de Variables */}
        <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3498db]/15 text-[#3498db]">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">Importancia de las variables clínicas</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Ponderación Gini de señales extraídas del artefacto desplegado
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {estadoEvaluacion === "cargando" ? (
              <Skeleton className="h-48 w-full" />
            ) : estadoEvaluacion === "error" ? (
              <ErrorPanel mensaje="No se pudieron cargar las importancias." onReintentar={cargarEvaluacion} />
            ) : evaluacion ? (
              <GraficoImportancia features={evaluacion.importancia_features} />
            ) : null}
          </CardContent>
        </Card>

        {/* Regresión Funcional del Endpoint /predecir */}
        <Card className="border border-slate-800 bg-[#131d2e] shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f39c12]/15 text-[#f39c12]">
                <Play className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-white">Regresión Funcional del Endpoint</CardTitle>
                  {resultados && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        todosLosChecksPasan
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {todosLosChecksPasan ? "100% Invariantes OK" : "Revisar invariantes"}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Validación de arquetipos clínicos contra el contrato de /predecir
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={ejecutarPruebas}
              disabled={corriendo}
              className="h-8 rounded-lg bg-[#16a085] hover:bg-[#138d75] text-white font-semibold text-xs transition-all shadow-md"
            >
              {corriendo ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ejecutando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5" />
                  Ejecutar pruebas
                </span>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {errorPruebas ? (
              <ErrorPanel mensaje={errorPruebas} onReintentar={ejecutarPruebas} />
            ) : !resultados ? (
              <VacioPanel
                titulo="Sin pruebas ejecutadas"
                detalle="Presioná 'Ejecutar pruebas' para validar invariantes del endpoint."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 bg-slate-900/80">
                      <TableHead className="text-xs text-slate-300 font-semibold">Caso clínico</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold">Inputs clave</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold text-right">Prob. abandono</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold">Nivel</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold">Esperado</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold text-center">Suma ≈ 1</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold text-center">Coherente</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold text-center">Acción</TableHead>
                      <TableHead className="text-xs text-slate-300 font-semibold text-right">Detalle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultados.map((resultado) => {
                      const abierto = casoDetalleAbierto === resultado.titulo
                      return (
                        <React.Fragment key={resultado.titulo}>
                          <TableRow className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                            <TableCell className="text-xs font-semibold text-white">{resultado.titulo}</TableCell>
                            <TableCell className="text-xs text-slate-400 font-mono">{resultado.inputsClave}</TableCell>
                            <TableCell className="text-right font-mono text-xs font-bold text-[#16a085]">
                              {(resultado.probabilidadAbandono * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 font-bold ${claseNivel(
                                  resultado.respuesta.nivel_riesgo
                                )}`}
                              >
                                {resultado.respuesta.nivel_riesgo}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-400">{resultado.resultadoEsperado}</TableCell>
                            <TableCell className="text-center">
                              {resultado.checks.sumaProbabilidades ? (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <Check className="h-3 w-3" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {resultado.checks.nivelCoherente ? (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <Check className="h-3 w-3" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {resultado.checks.accionNoVacia ? (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <Check className="h-3 w-3" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                  <X className="h-3 w-3" />
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCasoDetalleAbierto(abierto ? null : resultado.titulo)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                              >
                                {abierto ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </Button>
                            </TableCell>
                          </TableRow>

                          {abierto && (
                            <TableRow className="border-slate-800 bg-slate-900/90">
                              <TableCell colSpan={9} className="p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                                    <span className="font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                                      Acción Sugerida
                                    </span>
                                    <p className="text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] leading-relaxed">
                                      {resultado.respuesta.accion_sugerida}
                                    </p>
                                  </div>
                                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                                    <span className="font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                                      <ShieldCheck className="h-3.5 w-3.5 text-[#16a085]" />
                                      Probabilidades Invariantes
                                    </span>
                                    <div className="font-mono text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800 space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">P(Retorno):</span>
                                        <span className="text-white font-bold">{resultado.respuesta.probabilidad_retorno}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">P(Abandono):</span>
                                        <span className="text-[#16a085] font-bold">{resultado.probabilidadAbandono.toFixed(3)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}