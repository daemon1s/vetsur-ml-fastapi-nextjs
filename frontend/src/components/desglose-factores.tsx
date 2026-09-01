import React from "react"
import { Calendar, Syringe, History, Stethoscope, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import type { DatosPaciente, NivelRiesgo } from "@/types/vetsur"

interface DesgloseFactoresProps {
  datos: DatosPaciente
  nivelRiesgo: NivelRiesgo
  probabilidadAbandono: number
}

export function DesgloseFactores({ datos }: DesgloseFactoresProps) {
  const dias = datos.dias_desde_ultima_visita
  const tieneVacunas = datos.tiene_vacunas_al_dia
  const visitas = datos.visitas_historicas

  const getImpactoDias = () => {
    if (dias > 90) {
      return {
        tipo: "riesgo",
        texto: `${dias} días de inactividad aumentan fuertemente el riesgo de abandono (ventana mayor a 90 días).`,
        icono: AlertTriangle,
        color: "text-rose-300 bg-rose-950/30 border-rose-900/50",
      }
    }
    if (dias >= 30) {
      return {
        tipo: "preventivo",
        texto: `${dias} días sin visita. Se encuentra en la ventana preventiva ideal (30 a 90 días).`,
        icono: Info,
        color: "text-amber-300 bg-amber-950/30 border-amber-900/50",
      }
    }
    return {
      tipo: "favorable",
      texto: `${dias} días de inactividad. Visita reciente y paciente activo en la clínica.`,
      icono: CheckCircle2,
      color: "text-emerald-300 bg-emerald-950/30 border-emerald-900/50",
    }
  }

  const getImpactoVacunas = () => {
    if (tieneVacunas) {
      return {
        tipo: "favorable",
        texto: "Esquema de vacunas al día. Factor protector que duplica la probabilidad de retorno.",
        icono: CheckCircle2,
        color: "text-emerald-300 bg-emerald-950/30 border-emerald-900/50",
      }
    }
    return {
      tipo: "riesgo",
      texto: "Vacunas pendientes o vencidas. Incrementa la probabilidad de fuga.",
      icono: AlertTriangle,
      color: "text-rose-300 bg-rose-950/30 border-rose-900/50",
    }
  }

  const getImpactoVisitas = () => {
    if (visitas >= 4) {
      return {
        tipo: "favorable",
        texto: `${visitas} atenciones registradas. Paciente con hábito de consulta establecido.`,
        icono: CheckCircle2,
        color: "text-emerald-300 bg-emerald-950/30 border-emerald-900/50",
      }
    }
    if (visitas >= 2) {
      return {
        tipo: "preventivo",
        texto: `${visitas} visitas históricas. Nivel medio de familiaridad con la sucursal.`,
        icono: Info,
        color: "text-amber-300 bg-amber-950/30 border-amber-900/50",
      }
    }
    return {
      tipo: "riesgo",
      texto: "Primera o segunda visita. Requiere seguimiento para consolidar fidelización.",
      icono: AlertTriangle,
      color: "text-amber-300 bg-amber-950/30 border-amber-900/50",
    }
  }

  const impactoDias = getImpactoDias()
  const impactoVacunas = getImpactoVacunas()
  const impactoVisitas = getImpactoVisitas()

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#131d2e] p-5 shadow-md space-y-4">
      <div>
        <h4 className="text-sm font-bold text-white tracking-tight">
          Por qué el modelo asignó este porcentaje
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Desglose de los principales factores clínicos e históricos evaluados
        </p>
      </div>

      <div className="space-y-2.5">
        <div className={`p-3 rounded-xl border flex items-start gap-3 ${impactoDias.color}`}>
          <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold block text-white">Tiempo transcurrido</span>
            <span className="leading-relaxed block">{impactoDias.texto}</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-start gap-3 ${impactoVacunas.color}`}>
          <Syringe className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold block text-white">Estado de vacunación</span>
            <span className="leading-relaxed block">{impactoVacunas.texto}</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-start gap-3 ${impactoVisitas.color}`}>
          <History className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold block text-white">Historial en la red</span>
            <span className="leading-relaxed block">{impactoVisitas.texto}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3 text-slate-300">
          <Stethoscope className="h-4 w-4 mt-0.5 text-[#16a085] flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold block text-white">Motivo de atención</span>
            <span className="leading-relaxed block">
              {datos.tipo_atencion} por {datos.diagnostico} en sucursal {datos.sucursal}.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
