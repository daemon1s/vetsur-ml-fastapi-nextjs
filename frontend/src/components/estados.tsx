import React from "react"
import { AlertTriangle, Inbox, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorPanelProps {
  mensaje: string
  onReintentar?: () => void
}

export function ErrorPanel({ mensaje, onReintentar }: ErrorPanelProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-900/60 bg-rose-950/20 px-6 py-8 text-center">
      <AlertTriangle className="h-6 w-6 text-rose-400" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-rose-200">No se pudieron cargar los datos</p>
        <p className="max-w-md text-xs leading-relaxed text-slate-400">{mensaje}</p>
      </div>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reintentar
        </button>
      )}
    </div>
  )
}

interface VacioPanelProps {
  titulo: string
  detalle: string
}

export function VacioPanel({ titulo, detalle }: VacioPanelProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-8 text-center">
      <Inbox className="h-5 w-5 text-slate-500" />
      <p className="text-sm font-semibold text-slate-300">{titulo}</p>
      <p className="text-xs text-slate-500">{detalle}</p>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-800/80", className)} />
}