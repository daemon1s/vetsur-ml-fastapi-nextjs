import type { DatosPaciente, NivelRiesgo } from "@/types/vetsur"

export interface PresetPredictor {
  titulo: string
  resultado_esperado: NivelRiesgo
  datos: DatosPaciente
}

export const presetsPredictor: PresetPredictor[] = [
  {
    titulo: "Cachorro canino en control",
    resultado_esperado: "Bajo",
    datos: {
      dias_desde_ultima_visita: 20,
      visitas_historicas: 4,
      monto_cobrado: 28000,
      costo_medicamento: 8000,
      tiene_vacunas_al_dia: true,
      edad_mascota_anios: 1,
      raza_registrada: true,
      especie: "Perro",
      sucursal: "Las Condes",
      tipo_atencion: "Consulta general",
      diagnostico: "Control rutina",
    },
  },
  {
    titulo: "Gato adulto sin vacunas",
    resultado_esperado: "Medio",
    datos: {
      dias_desde_ultima_visita: 75,
      visitas_historicas: 2,
      monto_cobrado: 35000,
      costo_medicamento: 15000,
      tiene_vacunas_al_dia: false,
      edad_mascota_anios: 6,
      raza_registrada: false,
      especie: "Gato",
      sucursal: "Providencia",
      tipo_atencion: "Consulta general",
      diagnostico: "Dermatitis",
    },
  },
  {
    titulo: "Perro senior con inactividad >90 días",
    resultado_esperado: "Alto",
    datos: {
      dias_desde_ultima_visita: 120,
      visitas_historicas: 1,
      monto_cobrado: 45000,
      costo_medicamento: 22000,
      tiene_vacunas_al_dia: false,
      edad_mascota_anios: 10,
      raza_registrada: false,
      especie: "Perro",
      sucursal: "Ñuñoa",
      tipo_atencion: "Hospitalización",
      diagnostico: "Gastroenteritis",
    },
  },
]