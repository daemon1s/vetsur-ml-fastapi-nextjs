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
import { Input } from "@/components/ui/input"
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react"

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
      case "Alto":  return "bg-destructive/15 text-destructive border border-destructive/30"
      case "Medio": return "bg-amber-500/15 text-amber-400 border border-amber-500/30"
      default:      return "bg-[#1D9E75]/15 text-[#1D9E75] border border-[#1D9E75]/30"
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
    { accessorKey: "paciente_id", header: "ID paciente" },
    { accessorKey: "especie", header: "Especie" },
    { accessorKey: "sucursal", header: "Sucursal" },
    { accessorKey: "dias_desde_ultima_visita", header: "Días sin visita" },
    {
      accessorKey: "probabilidad_abandono",
      header: "Riesgo %",
      cell: ({ row }: any) => {
        const val = row.getValue("probabilidad_abandono") as number
        return <span className="font-bold text-foreground tabular-nums">{(val * 100).toFixed(1)}%</span>
      }
    },
    {
      accessorKey: "nivel_riesgo",
      header: "Nivel",
      cell: ({ row }: any) => {
        const risk = row.getValue("nivel_riesgo") as string
        return <Badge className={`${colorBadge(risk)} text-xs font-bold`}>{risk}</Badge>
      }
    },
    {
      accessorKey: "accion_sugerida",
      header: "Acción sugerida",
      cell: ({ row }: any) => (
        <span className="text-muted-foreground text-xs">{row.getValue("accion_sugerida")}</span>
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
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente o sucursal..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-secondary border-border text-sm"
          />
        </div>
        <Button
          onClick={exportarCSV}
          className="bg-[#1D9E75] hover:bg-[#15805e] text-white flex gap-2 w-full md:w-auto text-xs font-bold h-9"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-secondary border-b border-border">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="h-10 px-4 text-left align-middle font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className="border-b border-border transition-colors hover:bg-secondary/60" style={{ animationDelay: `${i * 20}ms` }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 align-middle text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-40 text-center text-muted-foreground text-sm">
                  Sincronizando con el servidor...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          {table.getRowModel().rows.length} de {data.length} pacientes
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Pág. {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
