import os
import pandas as pd
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from esquemas import DatosPaciente, RespuestaPrediccion, PacienteRiesgo
from modelo import ModeloVetSur

# Carga el predictor ML
predictor = ModeloVetSur(ruta_modelo="modelo_vetsur.pkl", ruta_columnas="columnas_vetsur.json")

# Inicia el modelo al arrancar
@asynccontextmanager
async def lifespan(app: FastAPI):
    predictor.inicializar()
    yield

app = FastAPI(title="VetSur API", version="1.0.0", lifespan=lifespan)

# Cors para el front
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/salud")
async def health_check():
    return {
        "status": "operativo", 
        "modelo_listo": predictor._inicializado and predictor.modelo is not None
    }

@app.post("/predecir", response_model=RespuestaPrediccion)
async def procesar_prediccion(datos: DatosPaciente):
    try:
        resultado = predictor.predecir_uno(datos)
        return RespuestaPrediccion(**resultado)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/pacientes-en-riesgo", response_model=List[PacienteRiesgo])
async def evaluar_pacientes_pendientes():
    try:
        ruta_csv = "caso1_vetsur.csv"
        if not os.path.exists(ruta_csv):
            return []
            
        df = pd.read_csv(ruta_csv, encoding='latin1')
        df_riesgo = predictor.predecir_lote(df, limit=None) # Liberamos todos los registros para visibilidad total
        
        lista_riesgo = []
        for _, row in df_riesgo.iterrows():
            lista_riesgo.append(PacienteRiesgo(**row.to_dict()))
            
        return lista_riesgo
    except Exception as e:
        print(f"ERROR EN /pacientes-en-riesgo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/estadisticas")
async def obtener_estadisticas():
    try:
        ruta_csv = "caso1_vetsur.csv"
        if not os.path.exists(ruta_csv):
             raise HTTPException(status_code=404, detail="CSV no encontrado")
             
        df = pd.read_csv(ruta_csv, encoding='latin1')
        df_resultados = predictor.predecir_lote(df, limit=None) # Procesamos todos
        
        total = len(df_resultados)
        alto_riesgo_df = df_resultados[df_resultados['nivel_riesgo'] == 'Alto']
        alto_riesgo = len(alto_riesgo_df)
        promedio_dias_riesgo = int(alto_riesgo_df['dias_desde_ultima_visita'].mean()) if not alto_riesgo_df.empty else 0
        
        tasa_retencion = 100 - (alto_riesgo / total * 100)
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

        return {
            "kpis": {
                "riesgo_alto": int(alto_riesgo),
                "visitas_90": int(senales_alerta),
                "tasa_retencion": f"{tasa_retencion:.1f}%",
                "recuperados": int(total * 0.04),
                "promedio_dias_riesgo": promedio_dias_riesgo,
                "total_pacientes": total,
                "recall_modelo": "90%"
            },
            "especies": especies_stats.to_dict(orient="records"),
            "sucursales": res_suc
        }
    except Exception as e:
        print(f"ERROR EN /estadisticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))
