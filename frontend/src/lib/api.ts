import axios from "axios"
import type { DatosPaciente, RespuestaPrediccion, PacienteRiesgo } from "@/types/vetsur"

// Nota: Aquí definimos la dirección del servidor (Backend). 
// Si estamos en producción usa una variable de entorno, si no, usa el localhost.
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8008"

// Nota: Usamos Axios para realizar las peticiones HTTP de forma sencilla y organizada.
export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const apiObj = {
  // Nota: Este objeto agrupa todas las funciones que llaman a la API de Python.
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
