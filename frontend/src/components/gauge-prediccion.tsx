"use client"

import React from "react"

interface GaugePrediccionProps {
  probabilidadAbandono: number
  nivelRiesgo: "Alto" | "Medio" | "Bajo"
}

export function GaugePrediccion({
  probabilidadAbandono,
  nivelRiesgo,
}: GaugePrediccionProps) {
  const percentage = Math.min(100, Math.max(0, Number((probabilidadAbandono * 100).toFixed(1))))
  const angle = (percentage / 100) * 180 - 90

  const getColor = () => {
    if (nivelRiesgo === "Alto") return "#e74c3c"
    if (nivelRiesgo === "Medio") return "#f39c12"
    return "#16a085"
  }

  const radius = 80
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="relative w-60 h-36 flex items-end justify-center overflow-hidden mx-auto">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a085" />
              <stop offset="50%" stopColor="#f39c12" />
              <stop offset="100%" stopColor="#e74c3c" />
            </linearGradient>
          </defs>

          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          <g
            transform={`rotate(${angle}, 100, 100)`}
            className="transition-transform duration-700 ease-out"
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke="#f8fafc"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="7" fill="#f8fafc" />
            <circle cx="100" cy="100" r="3.5" fill="#0f172a" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center -mt-4 text-center">
        <span
          className="text-4xl font-extrabold tracking-tight font-mono transition-colors duration-500"
          style={{ color: getColor() }}
        >
          {percentage.toFixed(1)}%
        </span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">
          Probabilidad de abandono
        </span>
      </div>

      <div className="w-full flex justify-between text-[11px] font-semibold text-slate-500 px-2 mt-3 border-t border-slate-800 pt-2">
        <span className="text-[#16a085]">0% retención</span>
        <span className="text-[#f39c12]">50% preventivo</span>
        <span className="text-[#e74c3c]">100% abandono</span>
      </div>
    </div>
  )
}