import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KpiProps {
  titulo: string
  valor: string
  delta: string
  icono: "usuarios" | "calendario" | "tendencia" | "actividad"
  positivo: boolean
}

export function TarjetaKpi({ titulo, valor, delta, icono, positivo }: KpiProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-slate-900">{valor}</div>
        <div className="flex items-center mt-1">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${positivo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {delta}
            </span>
            <span className="text-[10px] text-slate-400 ml-2 font-medium">vs periodo anterior</span>
        </div>
      </CardContent>
    </Card>
  )
}
