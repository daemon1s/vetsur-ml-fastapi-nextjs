from pydantic import BaseModel, ConfigDict, Field
from typing import Literal

# Nota: Aquí definimos los valores exactos que la API puede recibir. 
# Esto ayuda a que el modelo no reciba datos extraños que no conoce.

# Tipos definidos para forzar validación real
TipoEspecie = Literal["Perro", "Gato", "Exótico", "Ave"]
TipoSucursal = Literal[
    "Las Condes", "Maipú", "Ñuñoa", "Peñalolén", 
    "Providencia", "Pudahuel", "San Miguel"
]
TipoAtencion = Literal[
    "Consulta especialidad", "Consulta general", 
    "Hospitalización", "Venta producto"
]
TipoDiagnostico = Literal[
    "Artritis C", "Control rutina", "Control rutina C",
    "Dermatitis", "Dermatitis C", "Diabetes", "Diabetes C",
    "Esterilización", "Esterilización C", "Fractura", "Fractura C",
    "Gastroenteritis", "Gastroenteritis C", "Otitis", "Otitis C",
    "Parvovirus", "Parvovirus C", "Tumor", "Tumor C"
]

class DatosPaciente(BaseModel):
    # Nota: BaseModel valida automáticamente que los datos que envía el frontend sean correctos.
    model_config = ConfigDict(extra="forbid")

    dias_desde_ultima_visita: int = Field(..., ge=0, le=540, description="Días transcurridos desde que el paciente visitó la clínica.")
    visitas_historicas: int = Field(..., ge=1, le=120, description="Cantidad de visitas previas registradas. Máximo realista de 10 años (1 mes = 1 asumiendo 120 max).")
    monto_cobrado: float = Field(..., ge=0.0, description="Costo total de la atención en CLP.")
    costo_medicamento: float = Field(..., ge=0.0, description="Costo de los medicamentos recetados.")
    tiene_vacunas_al_dia: bool = Field(..., description="Booleano que indica si las vacunas están al día.")
    
    # Nota: Los campos de abajo son necesarios para reconstruir las columnas One-Hot del modelo.
    edad_mascota_anios: float = Field(..., ge=0, le=30, description="Edad expresada en años.")
    raza_registrada: bool = Field(..., description="Si el paciente tiene una raza registrada (1) o es mestizo/no especificado (0).")
    
    especie: str = Field(..., description="Tipo de especie del paciente.")
    sucursal: str = Field(..., description="Sucursal donde se atendió al paciente.")
    tipo_atencion: str = Field(..., description="La categoría de atención prestada.")
    diagnostico: str = Field(..., description="Diagnóstico principal asociado a la consulta.")

class RespuestaPrediccion(BaseModel):
    # Nota: Este es el formato de respuesta que la API le devuelve al frontend.
    probabilidad_retorno: float = Field(..., ge=0.0, le=1.0)
    prediccion_clase: int = Field(..., description="1 si retorna, 0 si no retorna")
    nivel_riesgo: Literal["Alto", "Medio", "Bajo"] = Field(..., description="Nivel de riesgo de abandono del paciente.")
    accion_sugerida: str = Field(..., description="Acción sugerida para el equipo de retención.")

class PacienteRiesgo(BaseModel):
    # Nota: Estructura simplificada para mostrar a los pacientes en las tablas del dashboard.
    paciente_id: str
    dias_desde_ultima_visita: int
    especie: str
    sucursal: str
    tiene_vacunas_al_dia: bool
    probabilidad_abandono: float
    nivel_riesgo: Literal["Alto", "Medio", "Bajo"]
    accion_sugerida: str
