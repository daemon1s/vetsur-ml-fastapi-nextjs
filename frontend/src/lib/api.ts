import axios from "axios"
import type {
  DatosPaciente,
  RespuestaPrediccion,
  PacienteRiesgo,
  RespuestaEstadisticas,
} from "@/types/vetsur"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8008"

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

export const apiObj = {
  healthCheck: async (): Promise<{ status: string; modelo_listo: boolean }> => {
    const response = await apiClient.get<{ status: string; modelo_listo: boolean }>("/salud")
    return response.data
  },

  predecirPaciente: async (datos: DatosPaciente): Promise<RespuestaPrediccion> => {
    const response = await apiClient.post<RespuestaPrediccion>("/predecir", datos)
    return response.data
  },

  obtenerPacientesEnRiesgo: async (): Promise<PacienteRiesgo[]> => {
    const response = await apiClient.get<PacienteRiesgo[]>("/pacientes-en-riesgo")
    return response.data || []
  },

  obtenerEstadisticas: async (): Promise<RespuestaEstadisticas> => {
    const response = await apiClient.get<RespuestaEstadisticas>("/estadisticas")
    return response.data
  },
}
