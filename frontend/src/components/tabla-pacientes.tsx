"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  type Row,
} from "@tanstack/react-table"
import { apiObj } from "@/lib/api"
import type { PacienteRiesgo } from "@/types/vetsur"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Search, ChevronLeft, ChevronRight, MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, Mail, Copy, Check } from "lucide-react"
import { ErrorPanel } from "@/components/estados"

const normalizarSucursal = (s: string) => {
  const clean = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/_/g, " ").trim()
  const map: Record<string, string> = {
    nunoa: "Ñuñoa",
    penalolen: "Peñalolén",
    maipu: "Maipú",
    "las condes": "Las Condes",
    "la florida": "La Florida",
    providencia: "Providencia",
    pudahuel: "Pudahuel",
    "san miguel": "San Miguel",
  }
  return map[clean] || s
}

const normalizarEspecie = (s: string) => {
  const clean = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  const map: Record<string, string> = {
    perro: "Perro",
    gato: "Gato",
    exotico: "Exótico",
    ave: "Ave",
  }
  return map[clean] || s
}

type FilaPaciente = Row<PacienteRiesgo>

export function TablaPacientes() {
  const [data, setData] = useState<PacienteRiesgo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "paciente_id", desc: false }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeRiesgo, setActiveRiesgo] = useState("Todos")
  const [activeSucursal, setActiveSucursal] = useState("Todas")

  const normalizarBusqueda = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const cargarDatos = useCallback(() => {
    setLoading(true)
    setError(false)
    apiObj
      .obtenerPacientesEnRiesgo()
      .then((res) => {
        if (res) {
          setData(res)
        }
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const exportarCSV = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    if (rows.length === 0) return
    const headers = [
      "ID Paciente",
      "Especie",
      "Sucursal",
      "Días inactivo",
      "Vacunas al día",
      "Probabilidad de abandono",
      "Nivel de riesgo",
      "Acción sugerida",
    ]
    const csvData = rows.map((r) => [
      r.paciente_id,
      normalizarEspecie(r.especie),
      normalizarSucursal(r.sucursal),
      r.dias_desde_ultima_visita,
      r.tiene_vacunas_al_dia ? "Al día" : "Vencidas",
      `${(r.probabilidad_abandono * 100).toFixed(1)}%`,
      r.nivel_riesgo,
      `"${r.accion_sugerida.replace(/"/g, '""')}"`,
    ])
    const csvContent = [headers, ...csvData].map((e) => e.join(";")).join("\n")
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `censo_vetsur_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copiarGuion = (id: string, guion: string) => {
    navigator.clipboard.writeText(guion)
    setCopiadoId(id)
    setTimeout(() => setCopiadoId(null), 2000)
  }

  const columns = [
    {
      accessorKey: "paciente_id",
      header: "ID Paciente",
      cell: ({ row }: { row: FilaPaciente }) => (
        <span className="font-mono font-bold text-white tracking-tight">
          #{row.original.paciente_id}
        </span>
      ),
    },
    {
      accessorKey: "especie",
      header: "Especie",
      cell: ({ row }: { row: FilaPaciente }) => (
        <span className="font-medium text-slate-200">
          {normalizarEspecie(row.original.especie)}
        </span>
      ),
    },
    {
      accessorKey: "sucursal",
      header: "Sucursal",
      cell: ({ row }: { row: FilaPaciente }) => (
        <span className="text-slate-300 font-medium">
          {normalizarSucursal(row.original.sucursal)}
        </span>
      ),
    },
    {
      accessorKey: "dias_desde_ultima_visita",
      header: "Inactividad",
      cell: ({ row }: { row: FilaPaciente }) => {
        const dias = Number(row.original.dias_desde_ultima_visita)
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-slate-200">{dias} días</span>
            {dias > 90 && (
              <span
                className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0"
                title="Inactividad mayor a 90 días"
              />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "tiene_vacunas_al_dia",
      header: "Vacunas",
      cell: ({ row }: { row: FilaPaciente }) => {
        const alDia = row.original.tiene_vacunas_al_dia
        return (
          <Badge
            className={`text-[11px] font-semibold ${
              alDia
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
            }`}
          >
            {alDia ? "Al día" : "Vencidas"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "probabilidad_abandono",
      header: "Probabilidad de abandono",
      cell: ({ row }: { row: FilaPaciente }) => {
        const val = Number(row.original.probabilidad_abandono)
        const pct = (val * 100).toFixed(1)
        const isHigh = val >= 0.65
        const isMed = val >= 0.30 && val < 0.65

        const barColor = isHigh ? "bg-[#e74c3c]" : isMed ? "bg-[#f39c12]" : "bg-[#16a085]"
        const textColor = isHigh ? "text-rose-400" : isMed ? "text-amber-400" : "text-emerald-400"

        return (
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden flex-shrink-0 border border-slate-800">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, val * 100))}%` }}
              />
            </div>
            <span className={`font-mono text-xs font-bold ${textColor}`}>
              {pct}%
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "nivel_riesgo",
      header: "Nivel de riesgo",
      cell: ({ row }: { row: FilaPaciente }) => {
        const val = Number(row.original.probabilidad_abandono)
        const risk = val >= 0.65 ? "Alto" : val >= 0.30 ? "Medio" : "Bajo"

        if (risk === "Alto") {
          return (
            <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[11px] font-bold">
              Alto
            </Badge>
          )
        }
        if (risk === "Medio") {
          return (
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[11px] font-bold">
              Medio
            </Badge>
          )
        }
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
            Bajo
          </Badge>
        )
      },
    },
    {
      accessorKey: "accion_sugerida",
      header: "Acción sugerida",
      cell: ({ row }: { row: FilaPaciente }) => (
        <span className="relative inline-block max-w-[300px]">
          <span className="block cursor-help truncate text-xs text-slate-300 underline decoration-dotted decoration-slate-600 underline-offset-4">
            {row.original.accion_sugerida}
          </span>
          <span className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 hidden w-80 rounded-lg border border-slate-700 bg-[#101b2d] p-3 text-[11px] leading-relaxed text-slate-300 shadow-xl group-hover/accion:block">
            {row.original.accion_sugerida}
          </span>
        </span>
      ),
    },
    {
      id: "contacto",
      header: () => <span className="text-right block">Acciones</span>,
      cell: ({ row }: { row: FilaPaciente }) => {
        const paciente = row.original
        const sucursalFormateada = normalizarSucursal(paciente.sucursal)
        const guion = `Hola, le escribimos de la Clínica VetSur ${sucursalFormateada} para coordinar el control preventivo de su mascota (#${paciente.paciente_id}). ${paciente.accion_sugerida}`
        const mensaje = encodeURIComponent(guion)
        const whatsappUrl = `https://wa.me/?text=${mensaje}`
        const emailUrl = `mailto:?subject=${encodeURIComponent(`Control preventivo · VetSur ${sucursalFormateada}`)}&body=${mensaje}`
        const copiado = copiadoId === paciente.paciente_id

        return (
          <div className="flex justify-end gap-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Enviar por WhatsApp"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 transition-colors hover:bg-emerald-500/25"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </a>
            <a
              href={emailUrl}
              title="Enviar por email"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800"
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => copiarGuion(paciente.paciente_id, guion)}
              title={copiado ? "Guion copiado" : "Copiar guion de contacto"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800"
            >
              {copiado ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )
      },
    },
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
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId)
      if (!value) return false
      return normalizarBusqueda(String(value)).includes(normalizarBusqueda(filterValue))
    },
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Censo de pacientes y riesgo de abandono
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Priorización de llamadas y campañas según el riesgo de abandono
          </p>
        </div>

        <div className="flex w-full md:w-auto flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Buscar por ID o sucursal..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 pl-9 text-xs bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-[#16a085]"
            />
          </div>

          <select
            value={activeSucursal}
            onChange={(e) => {
              const val = e.target.value
              setActiveSucursal(val)
              table.getColumn("sucursal")?.setFilterValue(val === "Todas" ? "" : val)
            }}
            aria-label="Filtrar por sucursal"
            className="h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:border-[#16a085]"
          >
            <option value="Todas">Todas las sucursales</option>
            <option value="Las Condes">Las Condes</option>
            <option value="Providencia">Providencia</option>
            <option value="Ñuñoa">Ñuñoa</option>
            <option value="Maipú">Maipú</option>
            <option value="La Florida">La Florida</option>
            <option value="Peñalolén">Peñalolén</option>
            <option value="San Miguel">San Miguel</option>
            <option value="Pudahuel">Pudahuel</option>
          </select>

          <select
            value={activeRiesgo}
            onChange={(e) => {
              const val = e.target.value
              setActiveRiesgo(val)
              table.getColumn("nivel_riesgo")?.setFilterValue(val === "Todos" ? "" : val)
            }}
            aria-label="Filtrar por nivel de riesgo"
            className="h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:border-[#16a085]"
          >
            <option value="Todos">Todos los niveles</option>
            <option value="Alto">Riesgo alto</option>
            <option value="Medio">Riesgo medio</option>
            <option value="Bajo">Riesgo bajo</option>
          </select>

          <Button
            onClick={exportarCSV}
            variant="outline"
            size="sm"
            className="ml-auto h-9 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-[#16a085]" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50 shadow-md">
        <Table>
          <TableHeader className="bg-slate-900 border-b border-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`text-slate-400 font-bold text-xs py-3 px-4 select-none ${
                        canSort ? "cursor-pointer hover:text-white transition-colors" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {canSort && (
                          <span className="text-slate-500">
                            {sortDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-[#16a085]" />
                            ) : sortDir === "desc" ? (
                              <ArrowDown className="h-3.5 w-3.5 text-[#16a085]" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-slate-800 text-xs text-slate-200">
            {error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-4">
                  <ErrorPanel
                    mensaje="No se pudo obtener el censo de pacientes desde la API."
                    onReintentar={cargarDatos}
                  />
                </TableCell>
              </TableRow>
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-[#16a085] border-t-transparent rounded-full animate-spin" />
                    <span>Cargando censo de pacientes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group/accion border-slate-800/80 hover:bg-slate-800/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-slate-400">
                  No se encontraron pacientes con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div>
          Mostrando{" "}
          <span className="font-semibold text-white">
            {table.getRowModel().rows.length}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-white">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          pacientes
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2.5 border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-slate-300">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2.5 border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
