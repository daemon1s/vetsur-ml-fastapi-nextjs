import { LucideIcon } from "lucide-react"

interface MetricDetail {
  label: string
  valor: string
  subtexto: string
  highlight?: boolean
}

interface KpiDualProps {
  metricaPrincipal: MetricDetail
  metricaSecundaria: MetricDetail
  icono: LucideIcon
  color?: string
}

export function TarjetaKpiML({ metricaPrincipal, metricaSecundaria, icono: Icono, color = "#1D9E75" }: KpiDualProps) {
  return (
    <div 
      className="relative overflow-hidden bg-[#0A0B10] border border-white/10 p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:border-white/20 group animate-in-up"
    >
      {/* Sheen reflectivo premium en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Borde superior de luz sutil */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-center">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <Icono className="h-4 w-4 transition-colors duration-500" style={{ color }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 divide-x divide-white/5">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              {metricaPrincipal.label}
            </p>
            <div className="text-4xl font-bold text-white tracking-tight drop-shadow-2xl">
              {metricaPrincipal.valor}
            </div>
            <p className={`text-[11px] font-bold tracking-tight ${metricaPrincipal.highlight ? "text-[#1D9E75]" : "text-white/40"}`}>
              {metricaPrincipal.subtexto}
            </p>
          </div>

          <div className="pl-8 space-y-2">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              {metricaSecundaria.label}
            </p>
            <div className="text-4xl font-bold text-white tracking-tight drop-shadow-2xl">
              {metricaSecundaria.valor}
            </div>
            <p className={`text-[11px] font-bold tracking-tight ${metricaSecundaria.highlight ? "text-[#1D9E75]" : "text-white/40"}`}>
              {metricaSecundaria.subtexto}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
