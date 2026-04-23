import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="bg-gradient-to-b from-[#1A1B23] to-[#13141C] border-border shadow-xl relative overflow-hidden group hover:border-[#1D9E75]/30 transition-all duration-300">
      {/* Subtle Background Accent */}
      <div 
        className="absolute right-0 top-0 w-32 h-32 blur-[100px] opacity-[0.03] pointer-events-none"
        style={{ backgroundColor: color }}
      />
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-6">
          <div className="p-2 rounded-xl bg-muted/30 border border-border/50">
            <Icono className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
              <div className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: color }} />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Analizado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-white/5">
          {/* Columna 1 */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              {metricaPrincipal.label}
            </p>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {metricaPrincipal.valor}
            </div>
            <p className={`text-[10px] font-medium ${metricaPrincipal.highlight ? "text-[#1D9E75]" : "text-muted-foreground/70"}`}>
              {metricaPrincipal.subtexto}
            </p>
          </div>

          {/* Columna 2 */}
          <div className="pl-4 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              {metricaSecundaria.label}
            </p>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {metricaSecundaria.valor}
            </div>
            <p className={`text-[10px] font-medium ${metricaSecundaria.highlight ? "text-[#1D9E75]" : "text-muted-foreground/70"}`}>
              {metricaSecundaria.subtexto}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
