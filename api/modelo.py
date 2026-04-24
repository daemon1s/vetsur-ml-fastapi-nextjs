import json
import joblib
import pandas as pd
import ftfy
import unicodedata
import logging
import os
from typing import Dict, Any, Tuple
from esquemas import DatosPaciente

logger = logging.getLogger("uvicorn.error")

class ModeloVetSur:
    _instancia = None

    def __new__(cls, *args, **kwargs):
        if not cls._instancia:
            cls._instancia = super(ModeloVetSur, cls).__new__(cls)
            cls._instancia._inicializado = False
        return cls._instancia

    def __init__(self, ruta_modelo: str = "modelo_vetsur.pkl", ruta_columnas: str = "columnas_vetsur.json"):
        if self._inicializado:
            return
        self.ruta_modelo = ruta_modelo
        self.ruta_columnas = ruta_columnas
        self.modelo = None
        self.columnas_esperadas = []
        self.MEDIANA_MONTO = 42100.0
        self.MEDIANA_COSTO = 9500.0
        self.resultados_cache = None
        self.inicializar()
        self._inicializado = True

    def inicializar(self) -> None:
        try:
            if os.path.exists(self.ruta_modelo):
                self.modelo = joblib.load(self.ruta_modelo)
            if os.path.exists(self.ruta_columnas):
                with open(self.ruta_columnas, "r") as f:
                    self.columnas_esperadas = json.load(f)
        except Exception as e:
            logger.error(f"Error cargando modelo: {e}")

    def _limpiar_texto(self, texto: str) -> str:
        if not texto: return ""
        # Limpieza manual de mojibake específico (tal cual el notebook del usuario)
        t = texto.replace('exa³tico', 'exotico').replace('Exa³tico', 'Exotico')
        t = ftfy.fix_text(t)
        t = "".join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')
        return t.lower().strip().replace(" ", "_").replace(".", "").replace("-", "_")

    def _evaluar_riesgo(self, probabilidad_abandono: float) -> Tuple[str, str]:
        if probabilidad_abandono >= 0.60:
            return "Alto", "Contactar inmediatamente al cliente por WhatsApp para ofrecer chequeo preventivo."
        elif probabilidad_abandono >= 0.20:
            return "Medio", "Sugerir campaña de recordatorio vía Email / Descuento peluquería."
        else:
            return "Bajo", "Programar recordatorio estándar en sistema, paciente leal."

    def predecir_uno(self, datos: DatosPaciente) -> Dict[str, Any]:
        df_input = pd.DataFrame([0] * len(self.columnas_esperadas), index=self.columnas_esperadas).T
        
        monto = datos.monto_cobrado if datos.monto_cobrado > 0 else self.MEDIANA_MONTO
        costo = datos.costo_medicamento if datos.costo_medicamento > 0 else self.MEDIANA_COSTO
        
        mapping = {
            f"especie_{self._limpiar_texto(datos.especie)}": 1,
            f"sucursal_{self._limpiar_texto(datos.sucursal)}": 1,
            f"tipo_atencion_{self._limpiar_texto(datos.tipo_atencion)}": 1,
            f"diagnostico_texto_{self._limpiar_texto(datos.diagnostico)}": 1,
            "dias_desde_ultima_visita": datos.dias_desde_ultima_visita,
            "visitas_historicas": datos.visitas_historicas,
            "monto_cobrado": monto,
            "costo_medicamento": costo,
            "tiene_vacunas_al_dia": 1 if datos.tiene_vacunas_al_dia else 0,
            "edad_mascota_anios": datos.edad_mascota_anios,
            "raza_registrada": 1 if datos.raza_registrada else 0
        }
        
        for col, val in mapping.items():
            if col in df_input.columns:
                df_input[col] = val

        if self.modelo:
            prob = self.modelo.predict_proba(df_input)[0][0] # Proba de no retorno
        else:
            prob = 0.5
            
        riesgo, accion = self._evaluar_riesgo(prob)
        return {
            "probabilidad_retorno": prob,
            "prediccion_clase": 1 if prob < 0.5 else 0,
            "nivel_riesgo": riesgo,
            "accion_sugerida": accion
        }

    def predecir_lote(self, df_pacientes: pd.DataFrame, limit: int = 50) -> pd.DataFrame:
        if df_pacientes.empty: return pd.DataFrame()
        if limit is None and self.resultados_cache is not None:
             return self.resultados_cache

        data = df_pacientes if limit is None else df_pacientes.head(limit)
        
        # Limpieza manual de mojibake (tal cual el notebook del usuario)
        if 'especie' in data.columns:
            data = data.copy()
            data['especie'] = data['especie'].str.replace('exa³tico', 'Exotico', case=False, regex=False)

        mediana_costo = float(data['costo_medicamento'].median()) if 'costo_medicamento' in data.columns else 0
        
        df_clean = data.copy()
        df_clean['costo_medicamento'] = df_clean['costo_medicamento'].fillna(mediana_costo).fillna(0)
        
        # Limpieza para el modelo
        df_prep = pd.DataFrame(index=df_clean.index)
        df_prep['dias_desde_ultima_visita'] = df_clean['dias_desde_ultima_visita'].fillna(0)
        df_prep['visitas_historicas'] = df_clean['visitas_historicas'].fillna(0)
        df_prep['monto_cobrado'] = df_clean['monto_cobrado'].fillna(0)
        df_prep['costo_medicamento'] = df_clean['costo_medicamento']
        df_prep['tiene_vacunas_al_dia'] = df_clean['tiene_vacunas_al_dia'].apply(lambda x: 1 if x is True or x == 1 else 0)
        df_prep['edad_mascota_anios'] = df_clean['edad_mascota_anios'].fillna(0)
        df_prep['raza_registrada'] = df_clean['raza_registrada'].apply(lambda x: 1 if x is True or x == 1 else 0)

        # One hot encoding manual
        for col in self.columnas_esperadas:
            if col not in df_prep.columns:
                df_prep[col] = 0
                
        for cat_col, prefix in [('especie', 'especie_'), ('sucursal', 'sucursal_'), ('tipo_atencion', 'tipo_atencion_'), ('diagnostico_texto', 'diagnostico_texto_')]:
            if cat_col in df_clean.columns:
                for val in df_clean[cat_col].unique():
                    clean_val = self._limpiar_texto(str(val))
                    col_name = f"{prefix}{clean_val}"
                    if col_name in self.columnas_esperadas:
                        df_prep.loc[df_clean[cat_col] == val, col_name] = 1

        df_input = df_prep[self.columnas_esperadas]
        
        if self.modelo:
            probs = self.modelo.predict_proba(df_input)[:, 0]
        else:
            probs = [0.5] * len(df_input)

        res = []
        for i, (idx, row) in enumerate(data.iterrows()):
            p = float(probs[i])
            riesgo, accion = self._evaluar_riesgo(p)
            res.append({
                "paciente_id": str(row.get('paciente_id', f"PAC-{1000+idx}")),
                "dias_desde_ultima_visita": int(row.get('dias_desde_ultima_visita', 0)),
                "especie": self._limpiar_texto(str(row.get('especie', ''))).capitalize(),
                "sucursal": self._limpiar_texto(str(row.get('sucursal', ''))).replace('_', ' ').capitalize(),
                "tiene_vacunas_al_dia": bool(row.get('tiene_vacunas_al_dia', 0)),
                "probabilidad_abandono": p,
                "nivel_riesgo": riesgo,
                "accion_sugerida": accion
            })
        
        # Ordenamos por probabilidad de abandono descendente (Más riesgo arriba)
        res.sort(key=lambda x: x["probabilidad_abandono"], reverse=True)
        
        df_res = pd.DataFrame(res)
        if limit is None: self.resultados_cache = df_res
        return df_res
