import axios from "axios"
import type { DatosPaciente, RespuestaPrediccion, PacienteRiesgo } from "@/types/vetsur"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8008"

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const apiObj = {
  healthCheck: async () => {
    const response = await apiClient.get<{ status: string; modelo_listo: boolean }>("/salud")
    return response.data
  },

  predecirPaciente: async (datos: DatosPaciente) => {
    const response = await apiClient.post<RespuestaPrediccion>("/predecir", datos)
    return response.data
  },

  obtenerPacientesEnRiesgo: async () => {
    const response = await apiClient.get<PacienteRiesgo[]>("/pacientes-en-riesgo")
    return response.data
  },

  obtenerEstadisticas: async () => {
    const response = await apiClient.get<any>("/estadisticas")
    return response.data
  },
}
