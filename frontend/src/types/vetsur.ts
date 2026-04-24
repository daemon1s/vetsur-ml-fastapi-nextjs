// Nota: Aquí definimos las interfaces de TypeScript. 
// Esto asegura que el Frontend use exactamente los mismos nombres de campos que el Backend.
export type NivelRiesgo = "Alto" | "Medio" | "Bajo"

export interface DatosPaciente {
  dias_desde_ultima_visita: number
  visitas_historicas: number
  monto_cobrado: number
  costo_medicamento: number
  tiene_vacunas_al_dia: boolean
  edad_mascota_anios: number
  raza_registrada: boolean
  especie: "Perro" | "Gato" | "Exótico" | "Ave"
  sucursal: "Las Condes" | "Maipú" | "Ñuñoa" | "Peñalolén" | "Providencia" | "Pudahuel" | "San Miguel"
  tipo_atencion: "Consulta Especialidad" | "Consulta General" | "Hospitalización" | "Venta Producto"
  diagnostico: "Artritis C" | "Control Rutina" | "Control Rutina C" | "Dermatitis" | "Dermatitis C" | "Diabetes" | "Diabetes C" | "Esterilización" | "Esterilización C" | "Fractura" | "Fractura C" | "Gastroenteritis" | "Gastroenteritis C" | "Otitis" | "Otitis C" | "Parvovirus" | "Parvovirus C" | "Tumor" | "Tumor C"
}

export interface RespuestaPrediccion {
  // Nota: Respuesta que envía el modelo de IA después de procesar un paciente.
  probabilidad_retorno: number
  prediccion_clase: number
  nivel_riesgo: NivelRiesgo
  accion_sugerida: string
}

export interface PacienteRiesgo {
  paciente_id: string
  dias_desde_ultima_visita: number
  especie: string
  sucursal: string
  tiene_vacunas_al_dia: boolean
  probabilidad_abandono: number
  nivel_riesgo: NivelRiesgo
  accion_sugerida: string
}
