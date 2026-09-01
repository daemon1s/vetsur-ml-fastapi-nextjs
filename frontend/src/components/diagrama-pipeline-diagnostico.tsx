"use client"

import React, { useState } from "react"
import { Database, Binary, Cpu, Gauge, Zap } from "lucide-react"

export function DiagramaPipelineDiagnostico() {
  const [pasoActivo, setPasoActivo] = useState<number | null>(null)

  const pasos = [
    {
      id: 1,
      titulo: "1. Datos Clínicos",
      subtitulo: "Ingesta de 11 variables",
      detalle: "Captura días de inactividad, vacunas, atenciones previas, especie, costos y sucursal.",
      icono: Database,
      color: "#3498db",
    },
    {
      id: 2,
      titulo: "2. Encoding & Normalización",
      subtitulo: "Pipeline Scikit-Learn",
      detalle: "One-Hot encoding para variables categóricas e imputación estratificada de valores.",
      icono: Binary,
      color: "#9b59b6",
    },
    {
      id: 3,
      titulo: "3. Modelo de Decisión ML",
      subtitulo: "Ensamble de Árboles",
      detalle: "Evaluación probabilística ponderada según peso Gini de las características clínicas.",
      icono: Cpu,
      color: "#16a085",
    },
    {
      id: 4,
      titulo: "4. Calibración ROC",
      subtitulo: "Umbral de Decisión 0.5",
      detalle: "Alineación de probabilidades continuas con tolerancia de suma P(Retorno) + P(Fuga) = 1.0.",
      icono: Gauge,
      color: "#f39c12",
    },
    {
      id: 5,
      titulo: "5. Semáforo & Acción",
      subtitulo: "Retención Clínica",
      detalle: "Asignación de nivel de riesgo (Bajo, Medio, Alto) y recomendación operativa de fidelización.",
      icono: Zap,
      color: "#e74c3c",
    },
  ]

  return (
    <div className="space-y-3 select-none">
      {/* Visualizador de flujo con SVG */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox="0 0 920 150"
          role="img"
          aria-label="Diagrama del pipeline de inferencia y diagnóstico de Machine Learning"
          className="h-auto w-full rounded-xl bg-slate-950/60 border border-slate-800/80 p-2"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3498db" />
              <stop offset="25%" stopColor="#9b59b6" />
              <stop offset="50%" stopColor="#16a085" />
              <stop offset="75%" stopColor="#f39c12" />
              <stop offset="100%" stopColor="#e74c3c" />
            </linearGradient>

            <filter id="glowPipeline" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#16a085" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Línea conectora central con gradiente */}
          <line
            x1="80"
            y1="65"
            x2="840"
            y2="65"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeDasharray="4 4"
            strokeOpacity="0.7"
          />

          {/* Nodos de cada paso */}
          {pasos.map((paso, idx) => {
            const cx = 90 + idx * 185
            const isHovered = pasoActivo === paso.id

            return (
              <g
                key={paso.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setPasoActivo(paso.id)}
                onMouseLeave={() => setPasoActivo(null)}
              >
                {/* Caja contenedora del nodo */}
                <rect
                  x={cx - 75}
                  y="18"
                  width="150"
                  height="95"
                  rx="10"
                  fill="#0f172a"
                  fillOpacity="0.9"
                  stroke={isHovered ? paso.color : "#1e293b"}
                  strokeWidth={isHovered ? "2" : "1"}
                  filter={isHovered ? "url(#glowPipeline)" : undefined}
                  className="transition-all duration-200"
                />

                {/* Círculo indicador superior */}
                <circle
                  cx={cx}
                  cy="18"
                  r="12"
                  fill={paso.color}
                  stroke="#0b1320"
                  strokeWidth="2.5"
                />
                <text
                  x={cx}
                  y="22"
                  textAnchor="middle"
                  className="fill-white font-mono text-[10px] font-bold"
                >
                  {paso.id}
                </text>

                {/* Títulos del nodo */}
                <text
                  x={cx}
                  y="48"
                  textAnchor="middle"
                  className={`text-[11px] font-bold tracking-tight ${
                    isHovered ? "fill-white" : "fill-slate-200"
                  }`}
                >
                  {paso.titulo.replace(/^\d+\.\s*/, "")}
                </text>
                <text
                  x={cx}
                  y="63"
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[9px]"
                >
                  {paso.subtitulo}
                </text>

                {/* Badge inferior de estado */}
                <rect
                  x={cx - 50}
                  y="76"
                  width="100"
                  height="20"
                  rx="5"
                  fill={paso.color}
                  fillOpacity="0.15"
                  stroke={paso.color}
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <text
                  x={cx}
                  y="89"
                  textAnchor="middle"
                  className="text-[9px] font-semibold"
                  fill={paso.color}
                >
                  {isHovered ? "Ver detalle ➜" : "Pipeline activo"}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tarjeta explicativa de la etapa seleccionada */}
      {pasoActivo !== null && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-slate-300 shadow-md flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${pasos[pasoActivo - 1].color}25`,
              color: pasos[pasoActivo - 1].color,
            }}
          >
            {React.createElement(pasos[pasoActivo - 1].icono, { className: "h-4 w-4" })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {pasos[pasoActivo - 1].titulo}: {pasos[pasoActivo - 1].subtitulo}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                Paso {pasoActivo} de 5
              </span>
            </div>
            <p className="mt-0.5 text-slate-400">{pasos[pasoActivo - 1].detalle}</p>
          </div>
        </div>
      )}
    </div>
  )
}
