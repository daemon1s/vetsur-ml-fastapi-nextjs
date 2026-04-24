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
      className="relative overflow-hidden bg-[#13141C]/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] shadow-2xl transition-all hover:border-[#1D9E75]/30 group animate-in-up"
    >
      {/* Glow de esquina dinámico */}
      <div 
        className="absolute -right-16 -top-16 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <Icono className="h-5 w-5 text-white/40 group-hover:text-white transition-colors duration-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 divide-x divide-white/5">
          {/* Métrica 1 */}
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

          {/* Métrica 2 */}
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
