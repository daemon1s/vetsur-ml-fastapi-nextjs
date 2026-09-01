export interface PuntoCurvaRoc {
  fpr: number
  tpr: number
}

export interface EvaluacionModelo {
  dataset: {
    total_filas: number
    filas_test: number
    prevalencia_fuga: number
  }
  metricas: {
    accuracy: number
    precision_fuga: number
    recall_fuga: number
    f1_fuga: number
    auc_roc: number
    brier: number
  }
  baseline: {
    accuracy_naive: number
    auc_naive: number
    lift_accuracy: number | null
    lift_auc: number
  }
  matriz_confusion: {
    verdaderos_negativos: number
    falsos_positivos: number
    falsos_negativos: number
    verdaderos_positivos: number
  }
  curva_roc: PuntoCurvaRoc[]
  importancia_features: {
    feature: string
    importancia: number
  }[]
}