import os
import pandas as pd
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from esquemas import DatosPaciente, RespuestaPrediccion, PacienteRiesgo
from modelo import ModeloVetSur
from evaluacion import evaluar_modelo_cacheado

# Nota: Instanciamos el predictor globalmente para que sea accesible desde todos los endpoints.
predictor = ModeloVetSur(ruta_modelo="modelo_vetsur.pkl", ruta_columnas="columnas_vetsur.json")

async def lifespan(app: FastAPI):
    # Nota: Inicializamos el predictor y pre-calculamos el lote con caso1_vetsur.csv para responder al instante.
    predictor.inicializar()
    ruta_csv = "caso1_vetsur.csv"
    if os.path.exists(ruta_csv):
        try:
            df = pd.read_csv(ruta_csv, encoding='latin1')
            predictor.predecir_lote(df, limit=None)
        except Exception as e:
            print(f"Aviso al precalentar caché: {e}")
    yield

app = FastAPI(title="VetSur API", version="1.0.0", lifespan=lifespan)

# Nota: Configuramos CORS para permitir que el frontend (Next.js) pueda consultar la API sin bloqueos de seguridad.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router principal compatible tanto con /api como con la raíz
api_router = APIRouter()

@api_router.get("/salud")
async def health_check():
    # Nota: Endpoint simple para verificar que la API y el modelo están operativos.
    return {
        "status": "operativo", 
        "modelo_listo": predictor._inicializado and predictor.modelo is not None
    }

@api_router.post("/predecir", response_model=RespuestaPrediccion)
async def procesar_prediccion(datos: DatosPaciente):
    # Nota: Recibe los datos del formulario y devuelve la probabilidad de abandono calculada por el modelo.
    try:
        resultado = predictor.predecir_uno(datos)
        return RespuestaPrediccion(**resultado)
    except Exception as e:
        # Nota: El error 500 indica que algo falló internamente en el servidor o en el modelo.
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@api_router.get("/evaluar-modelo")
async def evaluar_modelo():
    try:
        return evaluar_modelo_cacheado(predictor)
    except Exception as e:
        print(f"ERROR EN /evaluar-modelo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/pacientes-en-riesgo", response_model=List[PacienteRiesgo])
async def evaluar_pacientes_pendientes():
    # Nota: Procesa el CSV original ordenado secuencialmente por ID (PAC_00001, PAC_00002, ...)
    try:
        ruta_csv = "caso1_vetsur.csv"
        if not os.path.exists(ruta_csv):
            raise HTTPException(status_code=404, detail="Archivo CSV (caso1_vetsur.csv) no encontrado en el servidor.")
            
        df = pd.read_csv(ruta_csv, encoding='latin1')
        df_riesgo = predictor.predecir_lote(df, limit=None)
        
        lista_riesgo = []
        for _, row in df_riesgo.iterrows():
            lista_riesgo.append(PacienteRiesgo(**row.to_dict()))
            
        return lista_riesgo
    except Exception as e:
        print(f"ERROR EN /pacientes-en-riesgo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/estadisticas")
async def obtener_estadisticas():
    # Nota: Agrupa y calcula los indicadores clave (KPIs) para mostrar en los gráficos del dashboard gobernados por el PKL.
    try:
        ruta_csv = "caso1_vetsur.csv"
        if not os.path.exists(ruta_csv):
             raise HTTPException(status_code=404, detail="CSV no encontrado")
             
        df = pd.read_csv(ruta_csv, encoding='latin1')
        df_resultados = predictor.predecir_lote(df, limit=None)
        
        total = len(df_resultados)
        alto_riesgo_df = df_resultados[df_resultados['nivel_riesgo'] == 'Alto']
        medio_riesgo_df = df_resultados[df_resultados['nivel_riesgo'] == 'Medio']
        bajo_riesgo_df = df_resultados[df_resultados['nivel_riesgo'] == 'Bajo']

        alto_riesgo = len(alto_riesgo_df)
        medio_riesgo = len(medio_riesgo_df)
        bajo_riesgo = len(bajo_riesgo_df)

        promedio_dias_riesgo = int(alto_riesgo_df['dias_desde_ultima_visita'].mean()) if not alto_riesgo_df.empty else 0
        
        tasa_retencion = 100 - (alto_riesgo / total * 100) if total > 0 else 0
        senales_alerta = len(df[df['dias_desde_ultima_visita'] > 90])
        
        especies_stats = df_resultados['especie'].value_counts().reset_index()
        especies_stats.columns = ['especie', 'cantidad']
        
        suc_plot = df_resultados.groupby('sucursal')['nivel_riesgo'].value_counts().unstack(fill_value=0).reset_index()
        for col in ['Alto', 'Medio', 'Bajo']:
            if col not in suc_plot.columns:
                suc_plot[col] = 0

        res_suc = []
        for _, row in suc_plot.iterrows():
            res_suc.append({
                "sucursal": row['sucursal'],
                "riesgo": int(row['Alto']),
                "retorno": int(row['Bajo'] + row['Medio']),
                "pacientes": int(row['Alto'] + row['Medio'] + row['Bajo'])
            })

        # Métricas de vacunas calculadas sobre el dataset real y el PKL
        vacunas_al_dia = df_resultados[df_resultados['tiene_vacunas_al_dia'] == True]
        vacunas_vencidas = df_resultados[df_resultados['tiene_vacunas_al_dia'] == False]
        
        retorno_con_vacunas = round((len(vacunas_al_dia[vacunas_al_dia['nivel_riesgo'] != 'Alto']) / len(vacunas_al_dia) * 100), 1) if len(vacunas_al_dia) > 0 else 0.0
        retorno_sin_vacunas = round((len(vacunas_vencidas[vacunas_vencidas['nivel_riesgo'] != 'Alto']) / len(vacunas_vencidas) * 100), 1) if len(vacunas_vencidas) > 0 else 0.0
        
        return {
            "kpis": {
                "riesgo_alto": int(alto_riesgo),
                "visitas_90": int(senales_alerta),
                "tasa_retencion": f"{tasa_retencion:.1f}%",
                "recuperados": int(total * 0.04),
                "promedio_dias_riesgo": promedio_dias_riesgo,
                "total_pacientes": total,
                "recall_modelo": f"{round(evaluar_modelo_cacheado(predictor)['metricas']['recall_fuga'] * 100)}%",
                "riesgo_medio": int(medio_riesgo),
                "riesgo_bajo": int(bajo_riesgo)
            },
            "especies": especies_stats.to_dict(orient="records"),
            "sucursales": res_suc,
            "vacunas": {
                "al_dia_total": len(vacunas_al_dia),
                "vencidas_total": len(vacunas_vencidas),
                "tasa_con_vacunas": retorno_con_vacunas,
                "tasa_sin_vacunas": retorno_sin_vacunas,
                "diferencia": round(retorno_con_vacunas - retorno_sin_vacunas, 1)
            }
        }
    except Exception as e:
        print(f"ERROR EN /estadisticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("API_PORT", 8008)))
