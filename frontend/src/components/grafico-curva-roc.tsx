"use client"

import React, { useId } from "react"
import type { PuntoCurvaRoc } from "@/types/diagnostico"

interface GraficoCurvaRocProps {
  curva: PuntoCurvaRoc[]
  fprOperacion: number
  tprOperacion: number
  aucRoc?: number
}

const VIEW_W = 460
const VIEW_H = 270
const MARGIN_LEFT = 48
const MARGIN_RIGHT = 20
const MARGIN_TOP = 22
const MARGIN_BOTTOM = 46

const PLOT_W = VIEW_W - MARGIN_LEFT - MARGIN_RIGHT
const PLOT_H = VIEW_H - MARGIN_TOP - MARGIN_BOTTOM

const TICKS = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]

export function GraficoCurvaRoc({
  curva,
  fprOperacion,
  tprOperacion,
  aucRoc,
}: GraficoCurvaRocProps) {
  const gradientId = useId()
  const glowFilterId = useId()

  const puntosOrdenados = [...curva].sort((a, b) => a.fpr - b.fpr)

  const puntosSvg = puntosOrdenados.map((p) => {
    const x = MARGIN_LEFT + p.fpr * PLOT_W
    const y = MARGIN_TOP + (1 - p.tpr) * PLOT_H
    return { x, y, fpr: p.fpr, tpr: p.tpr }
  })

  const puntosString = puntosSvg.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")

  const primerPunto = puntosSvg[0] || { x: MARGIN_LEFT, y: MARGIN_TOP + PLOT_H }
  const ultimoPunto = puntosSvg[puntosSvg.length - 1] || {
    x: MARGIN_LEFT + PLOT_W,
    y: MARGIN_TOP,
  }

  const polygonPoints = [
    `${primerPunto.x},${MARGIN_TOP + PLOT_H}`,
    ...puntosSvg.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${ultimoPunto.x},${MARGIN_TOP + PLOT_H}`,
  ].join(" ")

  const xOperacion = MARGIN_LEFT + fprOperacion * PLOT_W
  const yOperacion = MARGIN_TOP + (1 - tprOperacion) * PLOT_H

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-[#16a085] shadow-sm shadow-[#16a085]/40 inline-block" />
            <span className="font-semibold text-slate-200">
              Curva ROC {aucRoc !== undefined ? `(AUC ${aucRoc.toFixed(3)})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 border-t-2 border-dashed border-slate-500 inline-block" />
            <span className="text-slate-400">Azar (AUC 0.500)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e74c3c] ring-2 ring-[#e74c3c]/30 inline-block" />
            <span className="text-slate-300 font-medium">Operación (umbral 0.5)</span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Curva ROC del modelo de predicción de abandono"
        className="h-auto w-full rounded-xl bg-slate-950/60 border border-slate-800/80 p-1"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a085" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#16a085" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#16a085" stopOpacity="0.01" />
          </linearGradient>

          <filter id={glowFilterId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#16a085" floodOpacity="0.45" />
          </filter>
        </defs>

        <rect
          x={MARGIN_LEFT}
          y={MARGIN_TOP}
          width={PLOT_W}
          height={PLOT_H}
          fill="#0f172a"
          fillOpacity="0.5"
          rx="4"
        />

        {TICKS.map((t) => {
          const x = MARGIN_LEFT + t * PLOT_W
          const y = MARGIN_TOP + (1 - t) * PLOT_H

          return (
            <g key={`grid-${t}`}>
              <line
                x1={MARGIN_LEFT}
                y1={y}
                x2={MARGIN_LEFT + PLOT_W}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity={t === 0 || t === 1 ? 0.6 : 0.35}
              />
              <text
                x={MARGIN_LEFT - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {t.toFixed(1)}
              </text>

              <line
                x1={x}
                y1={MARGIN_TOP}
                x2={x}
                y2={MARGIN_TOP + PLOT_H}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="3 3"
                strokeOpacity={t === 0 || t === 1 ? 0.6 : 0.35}
              />
              <text
                x={x}
                y={MARGIN_TOP + PLOT_H + 16}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {t.toFixed(1)}
              </text>
            </g>
          )
        })}

        <line
          x1={MARGIN_LEFT}
          y1={MARGIN_TOP + PLOT_H}
          x2={MARGIN_LEFT + PLOT_W}
          y2={MARGIN_TOP}
          stroke="#64748b"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          strokeOpacity="0.8"
        />

        {polygonPoints && (
          <polygon
            points={polygonPoints}
            fill={`url(#${gradientId})`}
          />
        )}

        {puntosString && (
          <polyline
            points={puntosString}
            fill="none"
            stroke="#16a085"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowFilterId})`}
          />
        )}

        {puntosSvg.length <= 30 &&
          puntosSvg.map((p, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={p.x}
              cy={p.y}
              r="2"
              fill="#16a085"
              stroke="#0f172a"
              strokeWidth="1"
              opacity="0.75"
            />
          ))}

        <g>
          <circle
            cx={xOperacion}
            cy={yOperacion}
            r="8"
            fill="#e74c3c"
            fillOpacity="0.25"
          />
          <circle
            cx={xOperacion}
            cy={yOperacion}
            r="4.5"
            fill="#e74c3c"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          <line
            x1={xOperacion}
            y1={yOperacion}
            x2={xOperacion}
            y2={MARGIN_TOP + PLOT_H}
            stroke="#e74c3c"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.6"
          />
          <line
            x1={MARGIN_LEFT}
            y1={yOperacion}
            x2={xOperacion}
            y2={yOperacion}
            stroke="#e74c3c"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.6"
          />
        </g>

        <text
          x={MARGIN_LEFT + PLOT_W / 2}
          y={MARGIN_TOP + PLOT_H + 36}
          textAnchor="middle"
          className="fill-slate-300 text-[11px] font-semibold tracking-wide"
        >
          Falsas alarmas (alertas sobre pacientes que sí regresaron)
        </text>

        <text
          x={-(MARGIN_TOP + PLOT_H / 2)}
          y="18"
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-slate-300 text-[11px] font-semibold tracking-wide"
        >
          Fugas detectadas (pacientes en riesgo identificados)
        </text>
      </svg>
    </div>
  )
}