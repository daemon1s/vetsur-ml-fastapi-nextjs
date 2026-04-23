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
import { Download, Search } from "lucide-react"

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
      case "Alto": return "bg-[#E24B4A]"
      case "Medio": return "bg-[#BA7517]"
      default: return "bg-[#1D9E75]"
    }
  }

  const exportarCSV = () => {
    const rows = table.getFilteredRowModel().rows.map(r => r.original)
    if (rows.length === 0) return

    const headers = ["ID Paciente", "Especie", "Sucursal", "Días s/Visita", "Riesgo %", "Nivel", "Acción CRM"]
    const csvData = rows.map(r => [
      r.paciente_id,
      r.especie,
      r.sucursal,
      r.dias_desde_ultima_visita,
      `${(r.probabilidad_abandono * 100).toFixed(1)}%`,
      r.nivel_riesgo,
      `"${r.accion_sugerida}"`
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
    { accessorKey: "paciente_id", header: "ID Paciente" },
    { accessorKey: "especie", header: "Especie" },
    { accessorKey: "sucursal", header: "Sucursal" },
    { accessorKey: "dias_desde_ultima_visita", header: "Días sin visita" },
    {
      accessorKey: "probabilidad_abandono",
      header: "Riesgo (%)",
      cell: ({ row }: any) => {
        const val = row.getValue("probabilidad_abandono") as number
        return <span className="font-semibold text-slate-900">{(val * 100).toFixed(1)}%</span>
      }
    },
    {
      accessorKey: "nivel_riesgo",
      header: "Nivel",
      cell: ({ row }: any) => {
        const risk = row.getValue("nivel_riesgo") as string
        return <Badge className={`${colorBadge(risk)} text-white`}>{risk}</Badge>
      }
    },
    { accessorKey: "accion_sugerida", header: "Acción Sugerida" },
  ]

  const table = useReactTable({
    data,
    columns,
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
                placeholder="Buscar paciente o sucursal..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:ring-[#1D9E75]"
            />
        </div>
        <Button onClick={exportarCSV} className="bg-[#1D9E75] hover:bg-[#15805e] text-white flex gap-2 w-full md:w-auto font-bold shadow-sm">
            <Download className="h-4 w-4" />
            Exportar reporte CSV
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-slate-50/80 border-b">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="h-12 px-4 text-left align-middle font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b transition-colors hover:bg-slate-50/50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4 align-middle text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-48 text-center">
                  <p className="text-slate-400 font-medium italic">Sincronizando con el servidor...</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm font-medium text-slate-500 italic">
          Mostrando {table.getRowModel().rows.length} de {data.length} pacientes filtrados
        </p>
        <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="font-semibold">Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="font-semibold">Siguiente</Button>
        </div>
      </div>
    </div>
  )
}
