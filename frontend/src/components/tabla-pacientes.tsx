"use client"
import React, { useState, useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { apiObj } from "@/lib/api"
import type { PacienteRiesgo } from "@/types/vetsur"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react"

export function TablaPacientes() {
  const [data, setData] = useState<PacienteRiesgo[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const [activeEspecie, setActiveEspecie] = useState("Todos")
  const [activeRiesgo, setActiveRiesgo] = useState("Todos")
  const [activeSucursal, setActiveSucursal] = useState("Todas")

  // Nota: Esta función normaliza el texto para que la búsqueda sea "inteligente" (ignora tildes).
  const normalize = (s: string) =>
    s.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")

  const displaySucursal = (s: string) => {
    const map: Record<string, string> = {
      "la florida": "La Florida",
      "las condes": "Las Condes",
      "maipu": "Maipú",
      "nunoa": "Ñuñoa",
      "penalolen": "Peñalolén",
      "providencia": "Providencia",
      "pudahuel": "Pudahuel",
      "san miguel": "San Miguel"
    }
    return map[s.toLowerCase()] || s
  }

  const displayEspecie = (s: string) => {
    const map: Record<string, string> = {
      "exotico": "Exótico",
      "perro": "Perro",
      "gato": "Gato",
      "ave": "Ave"
    }
    return map[s.toLowerCase()] || s
  }

  useEffect(() => {
    apiObj.obtenerPacientesEnRiesgo()
      .then(res => setData(res))
      .catch(e => console.error("Error en tabla:", e))
  }, [])

  const colorBadge = (riesgo: string) => {
    switch (riesgo) {
      case "Alto": return "bg-red-500/10 text-red-400 border border-red-500/20"
      case "Medio": return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      default: return "bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20"
    }
  }

  const exportarCSV = () => {
    const rows = table.getFilteredRowModel().rows.map(r => r.original)
    if (rows.length === 0) return
    const headers = ["ID Paciente", "Especie", "Sucursal", "Días s/visita", "Riesgo %", "Nivel", "Acción CRM"]
    const csvData = rows.map(r => [
      r.paciente_id, r.especie, r.sucursal,
      r.dias_desde_ultima_visita,
      `${(r.probabilidad_abandono * 100).toFixed(1)}%`,
      r.nivel_riesgo, `"${r.accion_sugerida}"`
    ])
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "reporte_riesgo_vetsur.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns = [
    {
      accessorKey: "paciente_id",
      header: "Paciente",
      cell: ({ row }: any) => <span className="font-bold text-white/80 tracking-tight">#{row.getValue("paciente_id")}</span>
    },
    { 
      accessorKey: "especie", 
      header: "Especie",
      cell: ({ row }: any) => displayEspecie(row.getValue("especie"))
    },
    {
      accessorKey: "sucursal",
      header: "Sucursal",
      cell: ({ row }: any) => displaySucursal(row.getValue("sucursal"))
    },
    {
      accessorKey: "dias_desde_ultima_visita",
      header: "Días sin Visita",
      cell: ({ row }: any) => <span className="font-bold text-white/90 tracking-tight">{row.getValue("dias_desde_ultima_visita")}d</span>
    },
    {
      accessorKey: "probabilidad_abandono",
      header: "Riesgo de Abandono",
      cell: ({ row }: any) => {
        const val = row.getValue("probabilidad_abandono") as number
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-12 hidden sm:block">
              <div
                className="h-full bg-[#1D9E75]"
                style={{ width: `${val * 100}%`, backgroundColor: val > 0.7 ? '#E24B4A' : '#1D9E75' }}
              />
            </div>
            <span className="font-bold text-white tabular-nums text-sm">{(val * 100).toFixed(1)}%</span>
          </div>
        )
      }
    },
    {
      accessorKey: "nivel_riesgo",
      header: "Nivel de Riesgo",
      cell: ({ row }: any) => {
        const risk = row.getValue("nivel_riesgo") as string
        return <Badge className={`${colorBadge(risk)} text-[9px] font-bold uppercase tracking-widest px-3`}>{risk}</Badge>
      }
    },
    {
      id: "acciones",
      header: "Acción CRM",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20 text-[#1D9E75] border border-[#1D9E75]/20"
            title="Contactar por WhatsApp"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
              <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10"
            title="Llamar al cliente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
            </svg>
          </Button>
        </div>
      )
    },
  ]

  const table = useReactTable({
    data, columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId)
      if (!value) return false
      return normalize(String(value)).includes(normalize(filterValue))
    },
    initialState: { pagination: { pageSize: 12 } }
  })

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-[#1D9E75] transition-colors" />
            <input
              placeholder="Buscar por ID o Sucursal..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 focus:border-[#1D9E75]/30 focus:ring-1 focus:ring-[#1D9E75]/10 rounded-2xl text-sm font-medium text-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={exportarCSV}
              className="flex-1 md:flex-none h-11 bg-[#1D9E75]/5 border border-[#1D9E75]/20 hover:bg-[#1D9E75]/10 hover:border-[#1D9E75]/40 text-white flex gap-2.5 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(29,158,117,0.05)] hover:shadow-[0_0_25px_rgba(29,158,117,0.2)]"
            >
              <Download className="h-4 w-4 text-[#1D9E75]" />
              Exportar excel
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-[#1D9E75] animate-pulse shadow-[0_0_10px_rgba(29,158,117,1)]" />
            <span className="text-xs font-bold text-white tracking-tight">
              {table.getFilteredRowModel().rows.length} <span className="text-white/40 font-medium uppercase text-[10px] tracking-widest ml-1">Pacientes encontrados</span>
            </span>
          </div>
          <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-1">Especie</span>
            <select
              value={activeEspecie}
              onChange={(e) => {
                const val = e.target.value
                setActiveEspecie(val)
                table.getColumn("especie")?.setFilterValue(val === "Todos" ? "" : val)
              }}
              className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs font-semibold text-white/80 focus:outline-none focus:border-[#1D9E75]/40 transition-all appearance-none cursor-pointer"
            >
              <option value="Todos" className="bg-[#13141C]">Todos</option>
              <option value="Perro" className="bg-[#13141C]">Perro</option>
              <option value="Gato" className="bg-[#13141C]">Gato</option>
              <option value="Exotico" className="bg-[#13141C]">Exótico</option>
              <option value="Ave" className="bg-[#13141C]">Ave</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-1">Nivel de Riesgo</span>
            <select
              value={activeRiesgo}
              onChange={(e) => {
                const val = e.target.value
                setActiveRiesgo(val)
                table.getColumn("nivel_riesgo")?.setFilterValue(val === "Todos" ? "" : val)
              }}
              className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs font-semibold text-white/80 focus:outline-none focus:border-amber-500/40 transition-all appearance-none cursor-pointer"
            >
              {["Todos", "Alto", "Medio", "Bajo"].map(opt => <option key={opt} value={opt} className="bg-[#13141C]">{opt}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-1">Sucursal</span>
            {/* El filtro de sucursal permite segmentar los datos por ubicación geográfica para mejorar la precisión del reporte */}
            <select
              value={activeSucursal}
              onChange={(e) => {
                const val = e.target.value
                setActiveSucursal(val)
                table.getColumn("sucursal")?.setFilterValue(val === "Todas" ? "" : val)
              }}
              className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs font-semibold text-white/80 focus:outline-none focus:border-blue-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="Todas" className="bg-[#13141C]">Todas las sucursales</option>
              <option value="La Florida" className="bg-[#13141C]">La Florida</option>
              <option value="Las Condes" className="bg-[#13141C]">Las Condes</option>
              <option value="Maipu" className="bg-[#13141C]">Maipú</option>
              <option value="Nunoa" className="bg-[#13141C]">Ñuñoa</option>
              <option value="Penalolen" className="bg-[#13141C]">Peñalolén</option>
              <option value="Providencia" className="bg-[#13141C]">Providencia</option>
              <option value="Pudahuel" className="bg-[#13141C]">Pudahuel</option>
              <option value="San Miguel" className="bg-[#13141C]">San Miguel</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden overflow-x-auto shadow-2xl relative">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-white/5 border-b border-white/5">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="h-14 px-6 text-left align-middle font-bold text-white/50 uppercase text-[9px] tracking-widest">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className="group transition-colors hover:bg-[#1D9E75]/5 animate-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-60 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-8 rounded-full border-2 border-[#1D9E75] border-t-transparent animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1D9E75] animate-pulse">Sincronizando Modelo...</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 disabled:opacity-20 transition-all text-white/50 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <Button variant="ghost" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 disabled:opacity-20 transition-all text-white/50 hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
