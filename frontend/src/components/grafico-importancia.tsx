"use client"

import React, { useState } from "react"
import { Sparkles, TrendingUp } from "lucide-react"

interface FeatureItem {
  feature: string
  importancia: number
}

interface GraficoImportanciaProps {
  features: FeatureItem[]
}

const DICCIONARIO_FEATURES: Record<
  string,
  { nombre: string; categoria: string; descripcion: string }
> = {
  dias_desde_ultima_visita: {
    nombre: "Días sin visita (inactividad)",
    categoria: "Comportamiento",
    descripcion: "Tiempo transcurrido desde el último contacto con la clínica.",
  },
  visitas_historicas: {
    nombre: "Visitas históricas acumuladas",
    categoria: "Fidelización",
    descripcion: "Frecuencia y hábito de atención en la red VetSur.",
  },
  tiene_vacunas_al_dia: {
    nombre: "Esquema vacunal al día",
    categoria: "Prevención",
    descripcion: "Protector clínico primordial que duplica la retención.",
  },
  costo_medicamento: {
    nombre: "Costo de medicamentos",
    categoria: "Financiero",
    descripcion: "Gasto en fármacos y tratamientos prescritos.",
  },
  monto_cobrado: {
    nombre: "Monto total de atención",
    categoria: "Financiero",
    descripcion: "Ticket total abonado en la última visita.",
  },
  edad_mascota_anios: {
    nombre: "Edad del paciente (años)",
    categoria: "Demografía",
    descripcion: "Etapa de vida de la mascota (cachorro, adulto, senior).",
  },
  especie: {
    nombre: "Especie del paciente",
    categoria: "Demografía",
    descripcion: "Perro, Gato, Exótico u otras especies tratadas.",
  },
  sucursal: {
    nombre: "Sucursal de atención",
    categoria: "Operacional",
    descripcion: "Clínica de la red donde se prestó el servicio.",
  },
  diagnostico: {
    nombre: "Diagnóstico clínico",
    categoria: "Clínico",
    descripcion: "Patología o motivo médico de la consulta previa.",
  },
  tipo_atencion: {
    nombre: "Tipo de atención médica",
    categoria: "Operacional",
    descripcion: "Consulta general, urgencia, control o cirugía.",
  },
  raza_registrada: {
    nombre: "Raza registrada",
    categoria: "Demografía",
    descripcion: "Identificación de raza pura o mestiza en ficha.",
  },
}

function formatearInfo(feature: string) {
  const normalizado = feature.toLowerCase().trim()
  if (DICCIONARIO_FEATURES[normalizado]) {
    return DICCIONARIO_FEATURES[normalizado]
  }
  const legible = feature
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
  return {
    nombre: legible,
    categoria: "General",
    descripcion: "Variable predictiva utilizada en el árbol de decisión.",
  }
}

export function GraficoImportancia({ features }: GraficoImportanciaProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const itemsOrdenados = [...features].sort((a, b) => b.importancia - a.importancia)
  const maximo = itemsOrdenados.length > 0 ? itemsOrdenados[0].importancia : 1

  const ITEM_HEIGHT = 44
  const SVG_HEIGHT = Math.max(220, itemsOrdenados.length * ITEM_HEIGHT + 24)
  const SVG_WIDTH = 580
  const BAR_START_X = 250
  const MAX_BAR_WIDTH = 230

  const hoveredItem = hoveredIdx !== null ? itemsOrdenados[hoveredIdx] : null
  const hoveredMeta = hoveredItem ? formatearInfo(hoveredItem.feature) : null

  return (
    <div className="space-y-3 select-none">
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role="img"
          aria-label="Gráfico de importancia de variables del modelo"
          className="h-auto w-full rounded-xl bg-slate-950/60 border border-slate-800/80 p-2"
        >
          <defs>
            {/* Gradientes para barras de importancia */}
            <linearGradient id="barGradTop" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#16a085" />
              <stop offset="100%" stopColor="#2ecc71" />
            </linearGradient>
            <linearGradient id="barGradHigh" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#16a085" />
              <stop offset="100%" stopColor="#3498db" />
            </linearGradient>
            <linearGradient id="barGradDefault" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {itemsOrdenados.map((item, idx) => {
            const meta = formatearInfo(item.feature)
            const y = 14 + idx * ITEM_HEIGHT
            const barWidth = Math.max(6, (item.importancia / maximo) * MAX_BAR_WIDTH)
            const esTop1 = idx === 0
            const esTop3 = idx < 3
            const isHovered = hoveredIdx === idx

            let fillGrad = "url(#barGradDefault)"
            if (esTop1) fillGrad = "url(#barGradTop)"
            else if (esTop3) fillGrad = "url(#barGradHigh)"

            return (
              <g
                key={item.feature}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Fondo resaltado en hover */}
                <rect
                  x="6"
                  y={y}
                  width={SVG_WIDTH - 12}
                  height={ITEM_HEIGHT - 6}
                  rx="8"
                  fill={isHovered ? "#1e293b" : "transparent"}
                  fillOpacity={isHovered ? 0.7 : 0}
                  className="transition-colors"
                />

                {/* Badge de Ranking (#1, #2, etc.) */}
                <rect
                  x="14"
                  y={y + 8}
                  width="26"
                  height="20"
                  rx="5"
                  fill={
                    esTop1
                      ? "#16a085"
                      : esTop3
                      ? "#1e293b"
                      : "#0f172a"
                  }
                  stroke={
                    esTop1
                      ? "#2ecc71"
                      : esTop3
                      ? "#334155"
                      : "#1e293b"
                  }
                  strokeWidth="1"
                />
                <text
                  x="27"
                  y={y + 22}
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold ${
                    esTop1 ? "fill-white" : "fill-slate-400"
                  }`}
                >
                  #{idx + 1}
                </text>

                {/* Nombre de la Variable */}
                <text
                  x="48"
                  y={y + 18}
                  className={`text-[12px] font-medium tracking-tight ${
                    isHovered || esTop1 ? "fill-white font-semibold" : "fill-slate-300"
                  }`}
                >
                  {meta.nombre}
                </text>
                <text
                  x="48"
                  y={y + 30}
                  className="fill-slate-500 text-[9px] uppercase tracking-wider font-semibold"
                >
                  {meta.categoria}
                </text>

                {/* Pista de fondo de la barra */}
                <rect
                  x={BAR_START_X}
                  y={y + 12}
                  width={MAX_BAR_WIDTH}
                  height="12"
                  rx="6"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1"
                />

                {/* Barra de progreso con gradiente */}
                <rect
                  x={BAR_START_X}
                  y={y + 12}
                  width={barWidth}
                  height="12"
                  rx="6"
                  fill={fillGrad}
                  opacity={isHovered ? 1 : 0.88}
                  className="transition-all duration-300"
                />

                {/* Porcentaje numérico */}
                <text
                  x={SVG_WIDTH - 18}
                  y={y + 22}
                  textAnchor="end"
                  className={`font-mono text-[12px] font-bold ${
                    esTop1
                      ? "fill-[#2ecc71]"
                      : isHovered
                      ? "fill-teal-300"
                      : "fill-slate-200"
                  }`}
                >
                  {(item.importancia * 100).toFixed(1)}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tooltip contextual explicativo según feature en hover */}
      {hoveredMeta && hoveredItem ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-slate-300 shadow-md">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#16a085]/20 text-[#16a085]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{hoveredMeta.nombre}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-teal-400">
                {(hoveredItem.importancia * 100).toFixed(1)}% peso relativo
              </span>
            </div>
            <p className="mt-0.5 text-slate-400">{hoveredMeta.descripcion}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#16a085]" />
            <span>Las 3 primeras variables concentran la mayor capacidad predictiva del modelo.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Gini / Feature Importance</span>
        </div>
      )}
    </div>
  )
}