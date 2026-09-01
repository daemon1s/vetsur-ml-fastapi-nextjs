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

    def __init__(self, ruta_modelo: str = "modelo_vetsur.pkl", ruta_columnas: str = "columnas_vetsur.json", ruta_imputaciones: str = "imputaciones_vetsur.json"):
        if self._inicializado:
            return
        self.ruta_modelo = ruta_modelo
        self.ruta_columnas = ruta_columnas
        self.ruta_imputaciones = ruta_imputaciones
        self.modelo = None
        self.columnas_esperadas = []
        self.imputaciones = {}
        self.resultados_cache = None
        self.inicializar()
        self._inicializado = True

    def inicializar(self) -> None:
        if not os.path.exists(self.ruta_modelo):
            raise FileNotFoundError(f"No se encontro el archivo del modelo en: {self.ruta_modelo}")
        if not os.path.exists(self.ruta_columnas):
            raise FileNotFoundError(f"No se encontro el archivo de columnas en: {self.ruta_columnas}")
        if not os.path.exists(self.ruta_imputaciones):
            raise FileNotFoundError(f"No se encontro el archivo de imputaciones en: {self.ruta_imputaciones}")

        try:
            self.modelo = joblib.load(self.ruta_modelo)
            with open(self.ruta_columnas, "r", encoding="utf-8") as f:
                self.columnas_esperadas = json.load(f)
            with open(self.ruta_imputaciones, "r", encoding="utf-8") as f:
                self.imputaciones = json.load(f)
        except Exception as e:
            logger.error(f"Error cargando modelo: {e}")
            raise e

    def _limpiar_texto(self, texto: str) -> str:
        if pd.isna(texto): return ""
        t = texto.replace('exa³tico', 'exotico').replace('Exa³tico', 'Exotico')
        t = ftfy.fix_text(t)
        t = "".join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')
        return t.lower().strip().replace(" ", "_").replace(".", "").replace("-", "_")

    def _formatear_sucursal(self, texto: str) -> str:
        s = self._limpiar_texto(str(texto))
        map_suc = {
            "nunoa": "Ñuñoa",
            "penalolen": "Peñalolén",
            "maipu": "Maipú",
            "las_condes": "Las Condes",
            "la_florida": "La Florida",
            "providencia": "Providencia",
            "pudahuel": "Pudahuel",
            "san_miguel": "San Miguel",
        }
        return map_suc.get(s, str(texto).replace('_', ' ').capitalize())

    def _formatear_especie(self, texto: str) -> str:
        s = self._limpiar_texto(str(texto))
        map_esp = {
            "perro": "Perro",
            "gato": "Gato",
            "exotico": "Exótico",
            "ave": "Ave",
        }
        return map_esp.get(s, str(texto).capitalize())

    def _evaluar_riesgo(self, probabilidad_abandono: float) -> Tuple[str, str]:
        if probabilidad_abandono >= 0.65:
            return "Alto", "Contactar inmediatamente al cliente por WhatsApp para ofrecer chequeo preventivo."
        elif probabilidad_abandono >= 0.30:
            return "Medio", "Sugerir recordatorio preventivo vía Email / Descuento en control o peluquería."
        else:
            return "Bajo", "Programar recordatorio estándar en sistema, paciente con buen ciclo de retorno."

    def predecir_uno(self, datos: DatosPaciente) -> Dict[str, Any]:
        df_input = pd.DataFrame([0] * len(self.columnas_esperadas), index=self.columnas_esperadas).T

        monto = datos.monto_cobrado if datos.monto_cobrado > 0 else self.imputaciones["mediana_monto"]
        tipo_limpio = self._limpiar_texto(datos.tipo_atencion)
        costo = datos.costo_medicamento if datos.costo_medicamento > 0 else self.imputaciones["mediana_costo_por_atencion"].get(tipo_limpio, self.imputaciones["mediana_costo_global"])
        dias = datos.dias_desde_ultima_visita

        mapping = {
            f"especie_{self._limpiar_texto(datos.especie)}": 1,
            f"sucursal_{self._limpiar_texto(datos.sucursal)}": 1,
            f"tipo_atencion_{tipo_limpio}": 1,
            f"diagnostico_texto_{self._limpiar_texto(datos.diagnostico)}": 1,
            "dias_desde_ultima_visita": dias,
            "visitas_historicas": datos.visitas_historicas,
            "monto_cobrado": monto,
            "costo_medicamento": costo,
            "tiene_vacunas_al_dia": 1 if datos.tiene_vacunas_al_dia else 0,
            "edad_mascota_anios": datos.edad_mascota_anios,
            "raza_registrada": 1 if datos.raza_registrada else 0,
        }

        for col, val in mapping.items():
            if col in df_input.columns:
                df_input[col] = val

        if not self.modelo:
            raise RuntimeError("El modelo no ha sido inicializado correctamente.")

        probs = self.modelo.predict_proba(df_input)[0]
        prob_abandono = round(float(probs[1]), 3)
        prob_retorno = round(float(probs[0]), 3)
        riesgo, accion = self._evaluar_riesgo(prob_abandono)

        return {
            "probabilidad_retorno": prob_retorno,
            "probabilidad_abandono": prob_abandono,
            "prediccion_clase": 0 if prob_abandono >= 0.5 else 1,
            "nivel_riesgo": riesgo,
            "accion_sugerida": accion
        }

    def predecir_lote(self, df_pacientes: pd.DataFrame, limit: int = None) -> pd.DataFrame:
        if df_pacientes.empty: return pd.DataFrame()
        if limit is None and self.resultados_cache is not None:
             return self.resultados_cache

        data = df_pacientes if limit is None else df_pacientes.head(limit)

        if 'especie' in data.columns:
            data = data.copy()
            data['especie'] = data['especie'].str.replace('exa³tico', 'Exotico', case=False, regex=False)

        df_clean = data.copy()

        for col in ['dias_desde_ultima_visita', 'visitas_historicas', 'monto_cobrado', 'edad_mascota_anios', 'tiene_vacunas_al_dia', 'raza_registrada']:
            if col not in df_clean.columns:
                df_clean[col] = 0

        if 'costo_medicamento' not in df_clean.columns:
            df_clean['costo_medicamento'] = 0
        if 'tipo_atencion' in df_clean.columns:
            tipo_limpio = df_clean['tipo_atencion'].apply(self._limpiar_texto)
            df_clean['costo_medicamento'] = df_clean['costo_medicamento'].fillna(tipo_limpio.map(self.imputaciones["mediana_costo_por_atencion"]))
        df_clean['costo_medicamento'] = df_clean['costo_medicamento'].fillna(self.imputaciones["mediana_costo_global"]).fillna(0)

        df_prep = pd.DataFrame(index=df_clean.index)
        dias_serie = df_clean['dias_desde_ultima_visita'].fillna(0)
        df_prep['dias_desde_ultima_visita'] = dias_serie
        df_prep['visitas_historicas'] = df_clean['visitas_historicas'].fillna(0)
        df_prep['monto_cobrado'] = df_clean['monto_cobrado'].fillna(0)
        df_prep['costo_medicamento'] = df_clean['costo_medicamento']
        df_prep['tiene_vacunas_al_dia'] = df_clean['tiene_vacunas_al_dia'].apply(lambda x: 1 if x is True or x == 1 else 0)
        df_prep['edad_mascota_anios'] = df_clean['edad_mascota_anios'].fillna(0)
        df_prep['raza_registrada'] = df_clean['raza_registrada'].apply(lambda x: 1 if x is True or x == 1 else 0)

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
            probs = self.modelo.predict_proba(df_input)
            probs_abandono = probs[:, 1]
        else:
            raise RuntimeError("El modelo no ha sido inicializado correctamente.")

        res = []
        for i, (idx, row) in enumerate(data.iterrows()):
            p_abandono = round(float(probs_abandono[i]), 3)
            dias = int(row.get('dias_desde_ultima_visita', 0))
            vacunas = bool(row.get('tiene_vacunas_al_dia', 0))

            riesgo, accion = self._evaluar_riesgo(p_abandono)

            res.append({
                "paciente_id": str(row.get('paciente_id', f"PAC_{1000+idx}")),
                "dias_desde_ultima_visita": dias,
                "especie": self._formatear_especie(str(row.get('especie', ''))),
                "sucursal": self._formatear_sucursal(str(row.get('sucursal', ''))),
                "tiene_vacunas_al_dia": vacunas,
                "probabilidad_abandono": p_abandono,
                "nivel_riesgo": riesgo,
                "accion_sugerida": accion
            })

        df_res = pd.DataFrame(res)
        if 'paciente_id' in df_res.columns:
            df_res = df_res.sort_values(by='paciente_id', ascending=True).reset_index(drop=True)
        if limit is None: self.resultados_cache = df_res
        return df_res