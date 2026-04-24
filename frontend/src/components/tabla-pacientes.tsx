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

  useEffect(() => {
    apiObj.obtenerPacientesEnRiesgo()
      .then(res => setData(res))
      .catch(e => console.error("Error en tabla:", e))
  }, [])

  const colorBadge = (riesgo: string) => {
    switch (riesgo) {
      case "Alto":  return "bg-red-500/10 text-red-400 border border-red-500/20"
      case "Medio": return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      default:      return "bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20"
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
    { accessorKey: "especie", header: "Especie" },
    { accessorKey: "sucursal", header: "Sucursal" },
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
      accessorKey: "accion_sugerida",
      header: "Acción Sugerida",
      cell: ({ row }: any) => (
        <span className="text-white/70 text-[11px] font-semibold leading-tight max-w-[220px] block line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
          {row.getValue("accion_sugerida")}
        </span>
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
    initialState: { pagination: { pageSize: 12 } }
  })

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-[#1D9E75] transition-colors" />
          <input
            placeholder="Filtrar por ID o Sucursal..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/5 focus:border-[#1D9E75]/30 focus:ring-1 focus:ring-[#1D9E75]/10 rounded-2xl text-sm font-medium text-white transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={exportarCSV}
            className="flex-1 md:flex-none h-11 bg-white/5 border border-white/5 hover:bg-white/10 text-white flex gap-2 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
          >
            <Download className="h-4 w-4 text-[#1D9E75]" />
            Data Export
          </Button>
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

      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
          Showing {table.getRowModel().rows.length} records
        </p>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 disabled:opacity-20 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="ghost" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 disabled:opacity-20 transition-all">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
