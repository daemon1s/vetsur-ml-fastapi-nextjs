import React from "react"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, AlertTriangle, Clock, HeartPulse } from "lucide-react"
import { Skeleton } from "@/components/estados"
import type { EstadisticasKpis } from "@/types/vetsur"

interface FichaKpiProps {
  etiqueta: string
  valor: string
  detalle: string
  colorAcento: string
  icono: LucideIcon
  cargando?: boolean
}

export const formatearNumero = (num: number | string) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

export function FichaKpi({
  etiqueta,
  valor,
  detalle,
  colorAcento,
  icono: Icono,
  cargando = false,
}: FichaKpiProps) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-[#101b2d] p-4 border-t-2 ${colorAcento}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400">{etiqueta}</p>
          {cargando ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1.5 font-mono text-3xl font-bold tracking-tight text-white">{valor}</p>
          )}
          {cargando ? (
            <Skeleton className="mt-2 h-3 w-36" />
          ) : (
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{detalle}</p>
          )}
        </div>
        <Icono className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </div>
  )
}

interface TarjetasKpiProps {
  kpis?: EstadisticasKpis
  cargando?: boolean
}

export function TarjetasKpiEjecutivas({ kpis, cargando = false }: TarjetasKpiProps) {
  const total = kpis?.total_pacientes ?? 0
  const riesgoAlto = kpis?.riesgo_alto ?? 0
  const tasaRetencion = kpis?.tasa_retencion ?? "0.0%"
  const ventanaPreventiva = kpis?.riesgo_medio ?? kpis?.visitas_90 ?? 0
  const activos = kpis?.riesgo_bajo ?? Math.max(0, total - riesgoAlto - ventanaPreventiva)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FichaKpi
        etiqueta="Tasa de retención global"
        valor={tasaRetencion}
        detalle={`${formatearNumero(total)} pacientes en las 8 clínicas`}
        colorAcento="border-t-[#16a085]"
        icono={TrendingUp}
        cargando={cargando}
      />
      <FichaKpi
        etiqueta="Pacientes en riesgo alto"
        valor={formatearNumero(riesgoAlto)}
        detalle="Probabilidad de abandono mayor a 65%"
        colorAcento="border-t-[#e74c3c]"
        icono={AlertTriangle}
        cargando={cargando}
      />
      <FichaKpi
        etiqueta="Ventana preventiva"
        valor={formatearNumero(ventanaPreventiva)}
        detalle="Entre 30 y 90 días sin visita"
        colorAcento="border-t-[#f39c12]"
        icono={Clock}
        cargando={cargando}
      />
      <FichaKpi
        etiqueta="Pacientes activos"
        valor={formatearNumero(activos)}
        detalle="Menos de 30 días desde su última visita"
        colorAcento="border-t-[#3498db]"
        icono={HeartPulse}
        cargando={cargando}
      />
    </div>
  )
}