export type NivelRiesgo = "Alto" | "Medio" | "Bajo"

export type TipoEspecie = "Perro" | "Gato" | "Exótico" | "Ave"

export type TipoSucursal =
  | "Las Condes"
  | "Maipú"
  | "Ñuñoa"
  | "Peñalolén"
  | "Providencia"
  | "Pudahuel"
  | "San Miguel"
  | "La Florida"

export type TipoAtencion =
  | "Consulta general"
  | "Consulta especialidad"
  | "Cirugía"
  | "Hospitalización"
  | "Venta producto"

export type TipoDiagnostico =
  | "Control rutina"
  | "Artritis"
  | "Dermatitis"
  | "Diabetes"
  | "Esterilización"
  | "Fractura"
  | "Gastroenteritis"
  | "Otitis"
  | "Parvovirus"
  | "Tumor"

export interface DatosPaciente {
  dias_desde_ultima_visita: number
  visitas_historicas: number
  monto_cobrado: number
  costo_medicamento: number
  tiene_vacunas_al_dia: boolean
  edad_mascota_anios: number
  raza_registrada: boolean
  especie: TipoEspecie
  sucursal: TipoSucursal
  tipo_atencion: TipoAtencion
  diagnostico: TipoDiagnostico
}

export interface RespuestaPrediccion {
  probabilidad_retorno: number
  probabilidad_abandono?: number
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

export interface EstadisticasKpis {
  riesgo_alto?: number
  riesgo_medio?: number
  riesgo_bajo?: number
  visitas_90?: number
  tasa_retencion?: string
  recuperados?: number
  promedio_dias_riesgo?: number
  total_pacientes?: number
  recall_modelo?: string
  activos_30d?: number
  preventivos_30_90d?: number
  fidelizados?: number
}

export interface EstadisticaEspecie {
  especie: string
  cantidad: number
}

export interface EstadisticaSucursal {
  sucursal: string
  riesgo: number
  retorno: number
  pacientes: number
}

export interface EstadisticaVacunas {
  al_dia_total: number
  vencidas_total: number
  tasa_con_vacunas: number
  tasa_sin_vacunas: number
  diferencia: number
}

export interface RespuestaEstadisticas {
  kpis: EstadisticasKpis
  especies: EstadisticaEspecie[]
  sucursales: EstadisticaSucursal[]
  vacunas?: EstadisticaVacunas
}
