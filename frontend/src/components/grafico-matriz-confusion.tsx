"use client"

import React from "react"
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react"

interface GraficoMatrizConfusionProps {
  verdaderosNegativos: number
  falsosPositivos: number
  falsosNegativos: number
  verdaderosPositivos: number
  filasTest: number
}

export function GraficoMatrizConfusion({
  verdaderosNegativos,
  falsosPositivos,
  falsosNegativos,
  verdaderosPositivos,
  filasTest,
}: GraficoMatrizConfusionProps) {
  const total =
    filasTest ||
    verdaderosNegativos + falsosPositivos + falsosNegativos + verdaderosPositivos ||
    1
  const fugasReales = verdaderosPositivos + falsosNegativos
  const retornosReales = verdaderosNegativos + falsosPositivos

  const pctTN = ((verdaderosNegativos / total) * 100).toFixed(1)
  const pctFP = ((falsosPositivos / total) * 100).toFixed(1)
  const pctFN = ((falsosNegativos / total) * 100).toFixed(1)
  const pctTP = ((verdaderosPositivos / total) * 100).toFixed(1)

  return (
    <div className="select-none h-full flex flex-col justify-center">
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 h-full flex flex-col justify-between">
        <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold pb-2 border-b border-slate-800/60">
          <div className="col-span-3 text-slate-500 text-[10px] uppercase tracking-wider flex items-center">
            Real \ predicho
          </div>
          <div className="col-span-4 text-center text-slate-300">
            Predicción: <span className="font-bold text-white">retorno</span>
          </div>
          <div className="col-span-5 text-center text-amber-300">
            Predicción: <span className="font-bold text-amber-400">fuga (alerta)</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 pt-3 items-stretch flex-1">
          <div className="col-span-3 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-slate-300">Real: retorno</span>
            <span className="text-[9px] text-slate-500">({retornosReales} pac.)</span>
          </div>

          <div className="col-span-4 rounded-lg border border-slate-700/60 bg-slate-900/80 p-3 flex items-center justify-between h-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-300">
                <ShieldCheck className="h-3 w-3 text-[#16a085] shrink-0" />
                <span className="truncate">Retención</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{pctTN}% total</span>
            </div>
            <span className="font-mono text-lg font-bold text-white">{verdaderosNegativos}</span>
          </div>

          <div className="col-span-5 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 flex items-center justify-between h-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">Falsa alarma</span>
              </div>
              <span className="text-[9px] text-amber-400/80 font-mono">{pctFP}% total</span>
            </div>
            <span className="font-mono text-lg font-bold text-amber-300">{falsosPositivos}</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 pt-3 items-stretch flex-1">
          <div className="col-span-3 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-rose-300">Real: fuga</span>
            <span className="text-[9px] text-slate-500">({fugasReales} pac.)</span>
          </div>

          <div className="col-span-4 rounded-lg border border-rose-900/40 bg-rose-950/20 p-3 flex items-center justify-between h-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-300">
                <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                <span className="truncate">No alertada</span>
              </div>
              <span className="text-[9px] text-rose-400/80 font-mono">{pctFN}% total</span>
            </div>
            <span className="font-mono text-lg font-bold text-rose-300">{falsosNegativos}</span>
          </div>

          <div className="col-span-5 rounded-lg border border-emerald-900/50 bg-emerald-950/25 p-3 flex items-center justify-between h-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="truncate">Fuga detectada</span>
              </div>
              <span className="text-[9px] text-emerald-400/80 font-mono">{pctTP}% total</span>
            </div>
            <span className="font-mono text-lg font-bold text-[#16a085]">{verdaderosPositivos}</span>
          </div>
        </div>
      </div>
    </div>
  )
}