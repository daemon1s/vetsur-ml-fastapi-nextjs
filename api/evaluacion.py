import os
from functools import lru_cache

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split

RUTA_CSV = "caso1_vetsur.csv"
SEMILLA_SPLIT = 42
TAMANO_TEST = 0.20
UMBRAL_CLASIFICACION = 0.5
PUNTOS_CURVA = 32
COLUMNAS_NUMERICAS = [
    "dias_desde_ultima_visita",
    "visitas_historicas",
    "monto_cobrado",
    "costo_medicamento",
    "edad_mascota_anios",
    "tiene_vacunas_al_dia",
    "raza_registrada",
]
COLUMNAS_CATEGORICAS = ["especie", "sucursal", "tipo_atencion", "diagnostico_texto"]


def _construir_matriz(df, limpiar_texto):
    df_limpio = df.copy()
    for columna in COLUMNAS_CATEGORICAS:
        df_limpio[columna] = df_limpio[columna].map(limpiar_texto)
    df_limpio["costo_medicamento"] = df_limpio.groupby("tipo_atencion")[
        "costo_medicamento"
    ].transform(lambda serie: serie.fillna(serie.median()))
    mediana_global = df_limpio["costo_medicamento"].median()
    df_limpio["costo_medicamento"] = df_limpio["costo_medicamento"].fillna(mediana_global)
    numericas = df_limpio[COLUMNAS_NUMERICAS].copy()
    numericas["tiene_vacunas_al_dia"] = numericas["tiene_vacunas_al_dia"].astype(int)
    numericas["raza_registrada"] = numericas["raza_registrada"].astype(int)
    dummies = pd.concat(
        [
            pd.get_dummies(df_limpio[columna], drop_first=False, dtype=int)
            for columna in COLUMNAS_CATEGORICAS
        ],
        axis=1,
    )
    return pd.concat([numericas, dummies], axis=1)


def _downsample_curva(fpr, tpr):
    indices = np.unique(np.linspace(0, len(fpr) - 1, PUNTOS_CURVA).astype(int))
    return [
        {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
        for i in indices
    ]


def _obtener_importancias(modelo):
    calibrados = getattr(modelo, "calibrated_classifiers_", None)
    if calibrados:
        estimador = calibrados[0].estimator
        importancias = estimador.feature_importances_
        columnas = list(estimador.feature_names_in_)
    else:
        importancias = getattr(modelo, "feature_importances_", None)
        columnas = list(getattr(modelo, "feature_names_in_", []))
    if importancias is None:
        return []
    return [
        {"feature": columna, "importancia": round(float(importancia), 4)}
        for columna, importancia in sorted(
            zip(columnas, importancias), key=lambda par: -par[1]
        )
    ]


def evaluar_modelo(predictor):
    if not os.path.exists(RUTA_CSV):
        raise FileNotFoundError(
            f"Archivo {RUTA_CSV} no encontrado para evaluar el modelo."
        )
    df = pd.read_csv(RUTA_CSV, encoding="latin1")
    X = _construir_matriz(df, predictor._limpiar_texto)
    y = (df["retorno_90d"] == 0).astype(int)
    columnas_modelo = predictor.columnas_esperadas
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=TAMANO_TEST, random_state=SEMILLA_SPLIT, stratify=y
    )
    X_test = X_test.reindex(columns=columnas_modelo, fill_value=0)
    probs = predictor.modelo.predict_proba(X_test)[:, 1]
    y_pred = (probs >= UMBRAL_CLASIFICACION).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    fpr, tpr, _ = roc_curve(y_test, probs)
    auc = float(roc_auc_score(y_test, probs))
    prevalencia = float(y_test.mean())
    accuracy_naive = max(prevalencia, 1 - prevalencia)
    accuracy = float(accuracy_score(y_test, y_pred))
    features = _obtener_importancias(predictor.modelo)
    return {
        "dataset": {
            "total_filas": len(df),
            "filas_test": int(len(y_test)),
            "prevalencia_fuga": round(prevalencia, 4),
        },
        "metricas": {
            "accuracy": round(accuracy, 4),
            "precision_fuga": round(
                float(precision_score(y_test, y_pred, pos_label=1, zero_division=0)), 4
            ),
            "recall_fuga": round(
                float(recall_score(y_test, y_pred, pos_label=1, zero_division=0)), 4
            ),
            "f1_fuga": round(
                float(f1_score(y_test, y_pred, pos_label=1, zero_division=0)), 4
            ),
            "auc_roc": round(auc, 4),
            "brier": round(float(brier_score_loss(y_test, probs)), 4),
        },
        "baseline": {
            "accuracy_naive": round(accuracy_naive, 4),
            "auc_naive": 0.5,
            "lift_accuracy": round(accuracy / accuracy_naive, 3)
            if accuracy_naive > 0
            else None,
            "lift_auc": round(auc / 0.5, 3),
        },
        "matriz_confusion": {
            "verdaderos_negativos": int(tn),
            "falsos_positivos": int(fp),
            "falsos_negativos": int(fn),
            "verdaderos_positivos": int(tp),
        },
        "curva_roc": _downsample_curva(fpr, tpr),
        "importancia_features": features,
    }


@lru_cache(maxsize=1)
def evaluar_modelo_cacheado(predictor):
    return evaluar_modelo(predictor)