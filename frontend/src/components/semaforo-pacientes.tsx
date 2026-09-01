import React from "react"
import { ShieldCheck, AlertCircle, AlertOctagon } from "lucide-react"
import { Skeleton } from "@/components/estados"

interface SemaforoPacientesProps {
  totalPacientes?: number
  riesgoAlto?: number
  riesgoMedio?: number
  riesgoBajo?: number
  cargando?: boolean
}

const formatNumber = (num: number | string) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

export function SemaforoPacientes({
  totalPacientes = 0,
  riesgoAlto = 0,
  riesgoMedio = 0,
  riesgoBajo,
  cargando = false,
}: SemaforoPacientesProps) {
  const total = totalPacientes || (riesgoAlto + riesgoMedio + (riesgoBajo || 0)) || 1
  const bajo = riesgoBajo !== undefined ? riesgoBajo : Math.max(0, total - riesgoAlto - riesgoMedio)
  const pctBajo = total > 0 ? ((bajo / total) * 100).toFixed(1) : "0.0"
  const pctMedio = total > 0 ? ((riesgoMedio / total) * 100).toFixed(1) : "0.0"
  const pctAlto = total > 0 ? ((riesgoAlto / total) * 100).toFixed(1) : "0.0"

  return (
    <div className="rounded-xl border border-slate-800 bg-[#131d2e] p-5 space-y-5">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Distribución del censo por riesgo
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Segmentación según la probabilidad de abandono calculada por el modelo
        </p>
      </div>

      {cargando ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-3 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="h-5 w-full rounded-full bg-slate-900 p-1 flex items-center gap-1 overflow-hidden border border-slate-800">
              <div
                style={{ width: `${pctBajo}%` }}
                className="h-full rounded-full bg-[#16a085]"
                title={`Bajo riesgo: ${pctBajo}% (${formatNumber(bajo)} pacientes)`}
              />
              <div
                style={{ width: `${pctMedio}%` }}
                className="h-full rounded-full bg-[#f39c12]"
                title={`Preventivo: ${pctMedio}% (${formatNumber(riesgoMedio)} pacientes)`}
              />
              <div
                style={{ width: `${pctAlto}%` }}
                className="h-full rounded-full bg-[#e74c3c]"
                title={`Riesgo urgente: ${pctAlto}% (${formatNumber(riesgoAlto)} pacientes)`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
              <span>0% probabilidad de abandono</span>
              <span>100% probabilidad de abandono</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#16a085]" />
                  <span className="text-xs font-bold text-slate-200">Zona verde · Bajo riesgo</span>
                </div>
                <ShieldCheck className="h-4 w-4 text-[#16a085]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#16a085]">{formatNumber(bajo)}</span>
                <span className="text-xs font-semibold text-slate-400">({pctBajo}%)</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Pacientes con retorno estimado favorable. Mantener recordatorios automáticos estándar.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f39c12]" />
                  <span className="text-xs font-bold text-slate-200">Zona amarilla · Preventivo</span>
                </div>
                <AlertCircle className="h-4 w-4 text-[#f39c12]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#f39c12]">{formatNumber(riesgoMedio)}</span>
                <span className="text-xs font-semibold text-slate-400">({pctMedio}%)</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Inactividad entre 30 y 90 días o vacunas por vencer. Enviar email o beneficio de chequeo.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#e74c3c]" />
                  <span className="text-xs font-bold text-slate-200">Zona roja · Riesgo urgente</span>
                </div>
                <AlertOctagon className="h-4 w-4 text-[#e74c3c]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#e74c3c]">{formatNumber(riesgoAlto)}</span>
                <span className="text-xs font-semibold text-slate-400">({pctAlto}%)</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Mayor a 65% probabilidad de fuga. Intervención directa vía WhatsApp y llamada de recepción.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}