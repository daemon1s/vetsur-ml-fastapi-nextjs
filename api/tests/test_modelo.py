import json

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from esquemas import DatosPaciente, PacienteRiesgo, RespuestaPrediccion
from main import app, predictor

DIAS_CHECKPOINTS = [0, 7, 15, 30, 60, 90, 120, 180, 365, 540]
ORDEN_RIESGO = {"Bajo": 0, "Medio": 1, "Alto": 2}
KPI_CLAVES = {
    "riesgo_alto",
    "visitas_90",
    "tasa_retencion",
    "recuperados",
    "promedio_dias_riesgo",
    "total_pacientes",
    "recall_modelo",
    "riesgo_medio",
    "riesgo_bajo",
}


def payload_base(**kwargs):
    payload = {
        "dias_desde_ultima_visita": 11,
        "visitas_historicas": 3,
        "monto_cobrado": 42100.0,
        "costo_medicamento": 6700.0,
        "tiene_vacunas_al_dia": True,
        "edad_mascota_anios": 4.0,
        "raza_registrada": True,
        "especie": "Perro",
        "sucursal": "Las Condes",
        "tipo_atencion": "Consulta general",
        "diagnostico": "Control rutina",
    }
    payload.update(kwargs)
    return payload


def predecir_payload(**kwargs):
    return predictor.predecir_uno(DatosPaciente(**payload_base(**kwargs)))


def lote_completo():
    df = pd.read_csv("caso1_vetsur.csv", encoding="latin1")
    return predictor.predecir_lote(df, limit=len(df))


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


class TestDeterminismo:
    def test_determinismo_una_prediccion(self):
        primero = predictor.predecir_uno(DatosPaciente(**payload_base()))
        segundo = predictor.predecir_uno(DatosPaciente(**payload_base()))
        assert primero == segundo

    def test_determinismo_lote(self):
        df = pd.DataFrame(
            [
                {
                    "paciente_id": "PAC_00001",
                    "dias_desde_ultima_visita": 11,
                    "visitas_historicas": 3,
                    "monto_cobrado": 42100.0,
                    "costo_medicamento": float("nan"),
                    "tiene_vacunas_al_dia": True,
                    "edad_mascota_anios": 4.0,
                    "raza_registrada": True,
                    "especie": "Perro",
                    "sucursal": "Las Condes",
                    "tipo_atencion": "Consulta general",
                    "diagnostico_texto": "Control rutina",
                },
                {
                    "paciente_id": "PAC_00002",
                    "dias_desde_ultima_visita": 300,
                    "visitas_historicas": 1,
                    "monto_cobrado": 15000.0,
                    "costo_medicamento": 2500.0,
                    "tiene_vacunas_al_dia": False,
                    "edad_mascota_anios": 8.0,
                    "raza_registrada": False,
                    "especie": "Gato",
                    "sucursal": "Maipú",
                    "tipo_atencion": "Consulta especialidad",
                    "diagnostico_texto": "Diabetes",
                },
            ]
        )
        primero = predictor.predecir_lote(df, limit=len(df))
        segundo = predictor.predecir_lote(df, limit=len(df))
        assert primero.equals(segundo)


class TestRiesgoClinico:
    def test_paciente_reciente_riesgo_bajo(self):
        resultado = predecir_payload()
        assert resultado["nivel_riesgo"] == "Bajo"
        assert resultado["probabilidad_abandono"] < 0.30

    def test_riesgo_nunca_desciende_con_dias(self):
        niveles = [
            predecir_payload(dias_desde_ultima_visita=dias)["nivel_riesgo"]
            for dias in DIAS_CHECKPOINTS
        ]
        for i in range(len(niveles) - 1):
            assert ORDEN_RIESGO[niveles[i + 1]] >= ORDEN_RIESGO[niveles[i]], (
                f"el nivel descendio en dias={DIAS_CHECKPOINTS[i]}: "
                f"{niveles[i]} -> {niveles[i + 1]}"
            )

    def test_probabilidad_no_decreciente_con_tolerancia(self):
        probabilidades = [
            predecir_payload(dias_desde_ultima_visita=dias)["probabilidad_abandono"]
            for dias in DIAS_CHECKPOINTS
        ]
        for i in range(len(probabilidades) - 1):
            assert probabilidades[i + 1] >= probabilidades[i] - 0.02, (
                f"la probabilidad descendio mas de la tolerancia en "
                f"dias={DIAS_CHECKPOINTS[i]}: {probabilidades[i]} -> {probabilidades[i + 1]}"
            )
        assert probabilidades[-1] >= probabilidades[4]
        assert probabilidades[4] >= probabilidades[3]
        assert probabilidades[3] < 0.30

    def test_contrato_duro_reciente_vacunado_no_alto(self):
        for dias in range(0, 31):
            resultado = predecir_payload(
                dias_desde_ultima_visita=dias,
                visitas_historicas=3,
                tiene_vacunas_al_dia=True,
            )
            assert resultado["nivel_riesgo"] != "Alto", f"paciente reciente clasificado Alto en dias={dias}"


class TestContratosArtefactos:
    def test_schema_coincide_con_pkl(self):
        with open("columnas_vetsur.json", "r", encoding="utf-8") as f:
            columnas = json.load(f)
        feature_names = list(predictor.modelo.feature_names_in_)
        assert columnas == feature_names
        assert len(columnas) == 7
        assert not any(col.startswith("inactividad_") for col in columnas)

    def test_orden_clases_pkl(self):
        assert list(predictor.modelo.classes_) == [0, 1]
        resultado = predecir_payload(
            especie="Dragon",
            sucursal="Antartica",
            tipo_atencion="acupuntura",
            diagnostico="covid19",
        )
        df_input = pd.DataFrame(
            [0] * len(predictor.columnas_esperadas), index=predictor.columnas_esperadas
        ).T
        for col, valor in [
            ("dias_desde_ultima_visita", 11),
            ("visitas_historicas", 3),
            ("monto_cobrado", 42100.0),
            ("costo_medicamento", 6700.0),
            ("tiene_vacunas_al_dia", 1),
            ("edad_mascota_anios", 4.0),
            ("raza_registrada", 1),
        ]:
            if col in predictor.columnas_esperadas:
                df_input[col] = valor
        probs = predictor.modelo.predict_proba(df_input)[0]
        assert resultado["probabilidad_abandono"] == round(float(probs[1]), 3)


class TestEndpoints:
    def test_contrato_predecir(self, client):
        respuesta = client.post("/predecir", json=payload_base())
        assert respuesta.status_code == 200
        resultado = RespuestaPrediccion(**respuesta.json())
        assert 0 <= resultado.probabilidad_abandono <= 1
        assert 0 <= resultado.probabilidad_retorno <= 1
        assert abs(resultado.probabilidad_abandono + resultado.probabilidad_retorno - 1) <= 0.002
        assert resultado.nivel_riesgo in {"Alto", "Medio", "Bajo"}

    def test_contrato_estadisticas(self, client):
        respuesta = client.get("/estadisticas")
        assert respuesta.status_code == 200
        datos = respuesta.json()
        assert {"kpis", "especies", "sucursales", "vacunas"} <= set(datos.keys())
        kpis = datos["kpis"]
        assert set(kpis.keys()) == KPI_CLAVES
        assert kpis["total_pacientes"] == 1400

    def test_contrato_pacientes_en_riesgo(self, client):
        respuesta = client.get("/pacientes-en-riesgo")
        assert respuesta.status_code == 200
        items = respuesta.json()
        assert len(items) == 1400
        for item in items:
            PacienteRiesgo(**item)
            assert 0 <= item["probabilidad_abandono"] <= 1

    def test_contrato_pacientes_en_riesgo_campos_modelo(self, client):
        respuesta = client.get("/pacientes-en-riesgo")
        assert respuesta.status_code == 200
        items = respuesta.json()
        assert len(items) == 1400
        for item in items:
            assert item["visitas_historicas"] is not None
            assert item["monto_cobrado"] is not None
            assert item["costo_medicamento"] is not None
            assert isinstance(item["tipo_atencion"], str) and item["tipo_atencion"].strip()
            assert item["visitas_historicas"] >= 1
            assert item["monto_cobrado"] >= 0
            assert item["costo_medicamento"] >= 0

    def test_salud_y_prefijo_api(self, client):
        for ruta in ["/salud", "/api/salud"]:
            respuesta = client.get(ruta)
            assert respuesta.status_code == 200
            assert respuesta.json()["status"] == "operativo"
            assert respuesta.json()["modelo_listo"] is True


class TestEvaluacionModelo:
    def test_contrato_evaluar_modelo(self, client):
        respuesta = client.get("/evaluar-modelo")
        assert respuesta.status_code == 200
        datos = respuesta.json()
        assert {"dataset", "metricas", "baseline", "matriz_confusion", "curva_roc", "importancia_features"} <= set(datos.keys())
        assert datos["dataset"]["total_filas"] == 1400
        assert datos["dataset"]["filas_test"] == 280
        assert 0.30 <= datos["dataset"]["prevalencia_fuga"] <= 0.50
        metricas = datos["metricas"]
        assert 0.60 <= metricas["accuracy"] <= 1.0
        assert 0.50 <= metricas["recall_fuga"] <= 1.0
        assert 0.50 <= metricas["precision_fuga"] <= 1.0
        assert 0.50 <= metricas["f1_fuga"] <= 1.0
        assert 0.70 <= metricas["auc_roc"] <= 1.0
        assert 0.0 <= metricas["brier"] <= 0.25
        matriz = datos["matriz_confusion"]
        total_matriz = matriz["verdaderos_negativos"] + matriz["falsos_positivos"] + matriz["falsos_negativos"] + matriz["verdaderos_positivos"]
        assert total_matriz == datos["dataset"]["filas_test"]
        assert len(datos["curva_roc"]) >= 20
        assert datos["curva_roc"][0]["fpr"] == 0.0
        assert datos["curva_roc"][0]["tpr"] == 0.0
        assert datos["curva_roc"][-1]["fpr"] == 1.0
        assert datos["curva_roc"][-1]["tpr"] == 1.0
        assert len(datos["importancia_features"]) == 7
        suma_importancias = sum(item["importancia"] for item in datos["importancia_features"])
        assert abs(suma_importancias - 1.0) <= 0.02
        assert datos["importancia_features"][0]["feature"] == "dias_desde_ultima_visita"

    def test_evaluacion_determinista(self, client):
        primero = client.get("/evaluar-modelo").json()
        segundo = client.get("/evaluar-modelo").json()
        assert primero == segundo

    def test_recall_modelo_calculado(self, client):
        respuesta = client.get("/estadisticas")
        assert respuesta.status_code == 200
        recall_estadisticas = respuesta.json()["kpis"]["recall_modelo"]
        recall_evaluacion = client.get("/evaluar-modelo").json()["metricas"]["recall_fuga"]
        assert recall_estadisticas == f"{round(recall_evaluacion * 100)}%"


class TestAdversariales:
    def test_categorias_desconocidas(self, client):
        respuesta = client.post(
            "/predecir",
            json=payload_base(
                especie="Dragon",
                sucursal="Antartica",
                tipo_atencion="acupuntura",
                diagnostico="covid19",
            ),
        )
        assert respuesta.status_code == 200

    def test_mojibake_equivalente(self):
        limpio = predecir_payload(especie="Exótico", sucursal="Maipú")
        mojibake = predecir_payload(especie="exa³tico", sucursal="MaipÃº")
        assert limpio == mojibake
        limpio_nunoa = predecir_payload(sucursal="Ñuñoa")
        mojibake_nunoa = predecir_payload(sucursal="Ã±uÃ±oa")
        assert limpio_nunoa == mojibake_nunoa

    def test_lote_con_nulos_y_mojibake(self):
        df = pd.DataFrame(
            [
                {
                    "paciente_id": "PAC_00001",
                    "dias_desde_ultima_visita": 30,
                    "visitas_historicas": 2,
                    "monto_cobrado": 50000.0,
                    "costo_medicamento": float("nan"),
                    "tiene_vacunas_al_dia": True,
                    "edad_mascota_anios": 3.0,
                    "raza_registrada": False,
                    "especie": "exa³tico",
                    "sucursal": "MaipÃº",
                    "tipo_atencion": "Consulta general",
                    "diagnostico_texto": "Dermatitis",
                },
                {
                    "paciente_id": "PAC_00002",
                    "dias_desde_ultima_visita": 100,
                    "visitas_historicas": 1,
                    "monto_cobrado": 0.0,
                    "costo_medicamento": 1000.0,
                    "tiene_vacunas_al_dia": False,
                    "edad_mascota_anios": 5.0,
                    "raza_registrada": True,
                    "especie": "Dragon",
                    "sucursal": "Antartica",
                    "tipo_atencion": "acupuntura",
                    "diagnostico_texto": "covid19",
                },
                {
                    "paciente_id": "PAC_00003",
                    "dias_desde_ultima_visita": 5,
                    "visitas_historicas": 4,
                    "monto_cobrado": 30000.0,
                    "costo_medicamento": 300.0,
                    "tiene_vacunas_al_dia": True,
                    "edad_mascota_anios": 2.0,
                    "raza_registrada": False,
                    "especie": "Perro",
                    "sucursal": "Las Condes",
                    "tipo_atencion": "Consulta general",
                    "diagnostico_texto": "Control rutina",
                },
            ]
        )
        resultado = predictor.predecir_lote(df, limit=len(df))
        assert len(resultado) == 3
        assert resultado["probabilidad_abandono"].isna().sum() == 0

    def test_lote_vacio(self):
        resultado = predictor.predecir_lote(pd.DataFrame())
        assert resultado.empty

    def test_lote_columna_faltante(self):
        df = pd.DataFrame(
            [
                {
                    "paciente_id": "PAC_00001",
                    "dias_desde_ultima_visita": 45,
                    "visitas_historicas": 3,
                    "costo_medicamento": 5000.0,
                    "tiene_vacunas_al_dia": True,
                    "edad_mascota_anios": 4.0,
                    "raza_registrada": False,
                    "especie": "Perro",
                    "sucursal": "Las Condes",
                    "tipo_atencion": "Consulta general",
                    "diagnostico_texto": "Dermatitis",
                }
            ]
        )
        resultado = predictor.predecir_lote(df, limit=len(df))
        assert len(resultado) == 1

    @pytest.mark.parametrize(
        "campo,valor",
        [
            ("dias_desde_ultima_visita", -1),
            ("dias_desde_ultima_visita", 541),
            ("visitas_historicas", 0),
            ("visitas_historicas", 121),
            ("edad_mascota_anios", -0.1),
            ("edad_mascota_anios", 30.5),
            ("monto_cobrado", -5),
        ],
    )
    def test_schema_rechaza_fuera_de_rango(self, client, campo, valor):
        payload = payload_base()
        payload[campo] = valor
        respuesta = client.post("/predecir", json=payload)
        assert respuesta.status_code == 422

    def test_schema_rechaza_campo_extra(self, client):
        payload = payload_base()
        payload["campo_extra"] = "invalido"
        respuesta = client.post("/predecir", json=payload)
        assert respuesta.status_code == 422


class TestGoldenCases:
    def test_golden_reciente_bajo(self):
        resultado = predecir_payload(
            dias_desde_ultima_visita=1, visitas_historicas=4
        )
        assert resultado["nivel_riesgo"] == "Bajo"
        assert resultado["probabilidad_abandono"] < 0.30

    def test_golden_cachorro_11d_bajo(self):
        resultado = predecir_payload(
            dias_desde_ultima_visita=11, visitas_historicas=4
        )
        assert resultado["nivel_riesgo"] == "Bajo"
        assert resultado["probabilidad_abandono"] < 0.30

    def test_golden_cronico_mensual_bajo(self):
        resultado = predecir_payload(
            dias_desde_ultima_visita=25, visitas_historicas=10
        )
        assert resultado["nivel_riesgo"] == "Bajo"
        assert resultado["probabilidad_abandono"] < 0.30

    def test_golden_postcirugia_11d_no_alto(self):
        resultado = predecir_payload(
            dias_desde_ultima_visita=11,
            visitas_historicas=2,
            tiene_vacunas_al_dia=False,
            costo_medicamento=54350.0,
            tipo_atencion="Cirugía",
        )
        assert resultado["probabilidad_abandono"] < 0.65

    def test_golden_inactivo_300d_alto(self):
        resultado = predecir_payload(
            dias_desde_ultima_visita=300,
            visitas_historicas=1,
            tiene_vacunas_al_dia=False,
        )
        assert resultado["nivel_riesgo"] == "Alto"
        assert resultado["probabilidad_abandono"] >= 0.65

    def test_golden_extremo_540d_alto(self):
        resultado = predecir_payload(
            dias_desde_ultima_visita=540,
            visitas_historicas=1,
            tiene_vacunas_al_dia=False,
        )
        assert resultado["nivel_riesgo"] == "Alto"
        assert resultado["probabilidad_abandono"] >= 0.60

    def test_tasa_base_modelo(self):
        resultado = lote_completo()
        media = resultado["probabilidad_abandono"].mean()
        assert 0.30 <= media <= 0.50

    def test_no_degeneracion(self):
        resultado = lote_completo()
        fraccion_alta = (resultado["probabilidad_abandono"] > 0.95).mean()
        fraccion_baja = (resultado["probabilidad_abandono"] < 0.05).mean()
        assert fraccion_alta < 0.30
        assert fraccion_baja < 0.50