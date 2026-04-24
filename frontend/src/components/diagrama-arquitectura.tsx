"use client"
import React, { useState, useMemo, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  Server,
  LayoutTemplate,
  TerminalSquare,
  Database,
  FileText,
  Trees,
  BrainCircuit,
  Container,
  Cloud,
  ShieldCheck,
  ChevronRight,
  ArrowRightLeft,
  Activity,
  Zap
} from "lucide-react"

// --- Configuración de Tiers ---
const TIERS = {
  CLIENT: { label: "Capa de Cliente", color: "#3B82F6", x: 120 },
  GATEWAY: { label: "Pasarela / Ingress", color: "#06B6D4", x: 420 },
  APP: { label: "Servicios de Aplicación", color: "#10B981", x: 750 },
  DATA: { label: "Capa de Datos", color: "#6366F1", x: 1080 }
}

// --- Componente de Portal para Tooltips ---
const TooltipPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

// --- Componente de Tooltip Premium ---
const Tooltip = ({ node, color, style }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 10 }}
    className="fixed w-80 p-5 bg-[#0B0C10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] pointer-events-none"
    style={style}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
        {node.logo ? node.logo : <node.icon className="w-5 h-5" style={{ color }} />}
      </div>
      <div>
        <h4 className="text-[13px] font-black text-white uppercase tracking-tighter">{node.title}</h4>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 opacity-40 text-white" />
          <span className="text-[9px] font-bold opacity-50 text-white uppercase">{node.subtitle}</span>
        </div>
      </div>
    </div>

    <p className="text-[11px] text-white/70 mb-4 leading-relaxed">{node.description}</p>

    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {node.techStack?.map((tech: string) => (
          <span key={tech} className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/50">
            {tech}
          </span>
        ))}
      </div>
      {node.port && (
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Puerto de Red</span>
          <span className="text-[11px] font-mono font-bold" style={{ color }}>:{node.port}</span>
        </div>
      )}
    </div>
  </motion.div>
)

// --- Componente de Nodo ---
const Node = ({ x, y, icon: Icon, title, subtitle, color, port, isSingleton, logo, description, techStack, onHover }: any) => {
  return (
    <motion.foreignObject
      x={x - 110}
      y={y - 80}
      width="220"
      height="180"
      className="overflow-visible"
    >
      <div
        className="relative flex flex-col items-center group cursor-help p-4 h-full"
        onMouseEnter={() => onHover({ x, y, icon: Icon, logo, title, subtitle, color, port, isSingleton, description, techStack })}
        onMouseLeave={() => onHover(null)}
      >
        {/* Dynamic Glow */}
        <div
          className="absolute inset-6 rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-700 scale-90 group-hover:scale-110"
          style={{ backgroundColor: color }}
        />

        {/* Card Body */}
        <div className="relative flex flex-col items-center w-full p-5 rounded-3xl bg-[#13141C]/60 backdrop-blur-xl border border-white/5 group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 shadow-2xl">

          {/* Main Icon Container */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-white/5 bg-white/5 relative z-10 transition-transform duration-500 group-hover:scale-110"
          >
            {logo ? logo : <Icon className="w-7 h-7" style={{ color }} />}

            {/* Singleton Badge Integrated */}
            {isSingleton && (
              <div className="absolute -top-2 -right-2 bg-amber-500 p-1 rounded-full shadow-lg border-2 border-[#13141C]">
                <Zap className="w-2.5 h-2.5 text-black" />
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-[13px] font-black text-white tracking-tight leading-none">{title}</h3>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color }}>
              {subtitle}
            </p>
          </div>

          {/* Port Badge Integrated */}
          {port && (
            <div className="mt-auto w-full flex justify-center pb-1">
              <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 opacity-60">
                <span className="text-[8px] font-mono font-medium text-white/80 uppercase tracking-wider">:{port}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.foreignObject>
  )
}

// --- Componente de Conexión Req/Res ---
const Connection = ({ start, end, label, color = TIERS.APP.color, duration = 4, delay = 0 }: any) => {
  const id = React.useId().replace(/:/g, "")
  const dx = end.x - start.x
  const dy = end.y - start.y

  // Curva Bezier Cúbica para un flujo más fluido
  const path = `M ${start.x} ${start.y} C ${start.x + dx / 2} ${start.y}, ${start.x + dx / 2} ${end.y}, ${end.x} ${end.y}`

  return (
    <g className="group">
      <defs>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={color} fillOpacity="0.4" />
        </marker>
      </defs>

      {/* Path Base */}
      <path
        id={id}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.1"
        strokeDasharray="4 4"
        markerEnd={`url(#arrow-${id})`}
      />

      {/* Resplandor del Path al Hover */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeOpacity="0"
        className="group-hover:stroke-opacity-10 transition-all duration-300 cursor-pointer"
      />

      {/* Partícula de Request (Sólida) */}
      <circle r="3" fill={color} className="filter drop-shadow-[0_0_8px_var(--glow-color)]" style={{ "--glow-color": color } as any}>
        <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} calcMode="spline" keySplines="0.4 0 0.2 1">
          <mpath href={`#${id}`} />
        </animateMotion>
      </circle>

      {/* Partícula de Response (Atenuada) */}
      <circle r="2" fill={color} fillOpacity="0.3">
        <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay + duration * 0.7}s`} keyPoints="1;0" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1">
          <mpath href={`#${id}`} />
        </animateMotion>
      </circle>

      {/* Label de Flujo */}
      {label && (
        <foreignObject x={(start.x + end.x) / 2 - 60} y={(start.y + end.y) / 2 - 12} width="120" height="24" className="overflow-visible pointer-events-none">
          <div className="flex items-center justify-center w-full h-full opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="bg-[#13141C]/90 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xl">
              <ArrowRightLeft className="w-2.5 h-2.5" style={{ color }} />
              <span className="text-[8px] font-bold text-white uppercase tracking-widest">{label}</span>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  )
}

export function DiagramaArquitectura() {
  const [hoveredNode, setHoveredNode] = useState<any>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const nodes = useMemo(() => ({
    user: { x: TIERS.CLIENT.x, y: 350 },
    nginx: { x: TIERS.GATEWAY.x, y: 350 },
    front: { x: TIERS.APP.x, y: 180 },
    back: { x: TIERS.APP.x, y: 520 },
    db: { x: TIERS.DATA.x, y: 420 },
    model: { x: TIERS.DATA.x, y: 620 }
  }), [])

  useEffect(() => {
    if (hoveredNode && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const x = rect.left + (hoveredNode.x / 1250) * rect.width
      const y = rect.top + (hoveredNode.y / 750) * rect.height
      setTooltipPos({ x, y })
    }
  }, [hoveredNode])

  return (
    <div className="w-full h-full min-h-[65vh] bg-[#0B0C10] rounded-[48px] p-8 md:p-12 overflow-hidden relative border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center">

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full" />
      </div>

      {/* Diagram Header - Lowered z-index to not cover tooltips */}
      <div className="absolute top-10 left-10 right-10 flex justify-between items-end z-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-3xl tracking-tight">Arquitectura de la solución</h2>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl">
            <Cloud className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-black text-white/80 uppercase">Servidor VPS (DigitalOcean)</span>
          </div>
        </div>
      </div>

      <div className="relative z-20 w-full max-w-7xl aspect-[1.8/1] mt-10 scale-90 md:scale-100 transition-transform">
        <svg ref={svgRef} viewBox="0 0 1250 750" className="w-full h-full overflow-visible">

          {/* Tier Labels (Vertical) */}
          <g className="opacity-50 pointer-events-none font-black text-[12px] uppercase tracking-[0.5em]">
            <text x={TIERS.CLIENT.x} y="730" textAnchor="middle" fill={TIERS.CLIENT.color}>Cliente</text>
            <text x={TIERS.GATEWAY.x} y="730" textAnchor="middle" fill={TIERS.GATEWAY.color}>Pasarela</text>
            <text x={TIERS.APP.x} y="730" textAnchor="middle" fill={TIERS.APP.color}>Servicios</text>
            <text x={TIERS.DATA.x} y="730" textAnchor="middle" fill={TIERS.DATA.color}>Datos</text>
          </g>

          {/* Connections */}
          <Connection start={nodes.user} end={nodes.nginx} label="TLS 1.3" color={TIERS.CLIENT.color} duration={5} />
          <Connection start={nodes.nginx} end={nodes.front} label="Proxy Pass" color={TIERS.GATEWAY.color} duration={4} delay={0.2} />

          {/* Flujo lógico: Frontend -> Backend */}
          <Connection start={nodes.front} end={nodes.back} label="Consumo API" color={TIERS.APP.color} duration={3} delay={1.5} isDashed={true} />

          {/* Explicit Data Flow Labels */}
          <Connection start={nodes.back} end={nodes.db} label="Lectura CSV" color={TIERS.APP.color} duration={3} delay={0.1} />
          <Connection start={nodes.back} end={nodes.model} label="Random Forest" color={TIERS.APP.color} duration={3} delay={1.1} />

          {/* Nodes - Client */}
          <Node
            {...nodes.user} color={TIERS.CLIENT.color}
            icon={Globe} title="Navegador web" subtitle="Interfaz de usuario"
            description="Interfaz reactiva que consume la API de FastAPI para visualizar KPIs de retención, gráficos de distribución y el panel de control de riesgo en tiempo real."
            techStack={["Tailwind CSS", "Framer Motion", "Lucide Icons"]}
            onHover={setHoveredNode}
          />

          {/* Nodes - Gateway */}
          <Node
            {...nodes.nginx} color={TIERS.GATEWAY.color} port="80/443"
            icon={Server} title="Nginx" subtitle="Proxy Inverso"
            description="El director de tráfico del servidor. Recibe todas las visitas y las reparte de forma inteligente entre la web y los servicios de datos de la API."
            techStack={["Nginx", "OpenSSL", "Docker"]}
            logo={
              <svg viewBox="0 0 128 128" className="w-8 h-8">
                <path fill="#009639" d="M64 0L12.1 30v68L64 128l51.9-30V30L64 0z" />
                <path fill="white" d="M82.1 39.5v49L45.9 39.5v49h8.2v-32l28 32h8.2v-49h-8.2z" />
              </svg>
            }
            onHover={setHoveredNode}
          />

          {/* Nodes - App */}
          <Node
            {...nodes.front} color={TIERS.CLIENT.color} port="3000"
            icon={LayoutTemplate} title="Next.js" subtitle="Frontend"
            description="El corazón de la interfaz de usuario. Se encarga de mostrar los paneles de control, manejar el predictor de IA y asegurar una navegación fluida."
            techStack={["Next.js 14", "TypeScript", "Axios"]}
            logo={
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-8 h-8">
                <path d="M7 17V7l10 10V7" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.2" />
              </svg>
            }
            onHover={setHoveredNode}
          />

          <Node
            {...nodes.back} color={TIERS.APP.color} port="8008"
            icon={TerminalSquare} title="FastAPI" subtitle="Backend"
            description="El cerebro lógico que procesa los datos de pacientes y calcula las estadísticas de retención y riesgo que alimentan los gráficos del dashboard."
            techStack={["Python", "FastAPI", "Uvicorn"]}
            logo={
              <svg viewBox="0 0 128 128" className="w-8 h-8">
                <rect width="128" height="128" rx="24" fill="#05998b" />
                <path d="M72.5 18L31 75.5h27V110l41.5-57.5h-27V18z" fill="white" />
              </svg>
            }
            onHover={setHoveredNode}
          />

          {/* Nodes - Data */}
          <Node
            {...nodes.db} color={TIERS.DATA.color}
            icon={FileText} title="Datos de pacientes" subtitle="Registros CSV"
            description="Dataset histórico basado en el archivo CSV de pacientes. Contiene registros clínicos, especies y frecuencia de visitas, sirviendo como input para el entrenamiento."
            techStack={["CSV", "Pandas", "FileSystem"]}
            logo={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8" style={{ color: TIERS.DATA.color }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 13h8M8 17h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            onHover={setHoveredNode}
          />

          <Node
            {...nodes.model} color={TIERS.DATA.color} isSingleton={true}
            icon={Trees} title="Predictor IA" subtitle="Random Forest"
            description="Inteligencia artificial que analiza el comportamiento clínico para predecir si un paciente podría no volver, sugiriendo acciones para recuperarlo."
            techStack={["Scikit-Learn", "Joblib", "NumPy"]}
            onHover={setHoveredNode}
          />

        </svg>
      </div>

      <TooltipPortal>
        <AnimatePresence>
          {hoveredNode && (
            <Tooltip
              node={hoveredNode}
              color={hoveredNode.color}
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: 'translate(-50%, -110%)'
              }}
            />
          )}
        </AnimatePresence>
      </TooltipPortal>

      {/* Bottom Status Bar - Cleaned up */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center opacity-30">
        <div />
        <div />
      </div>
    </div>
  )
}
