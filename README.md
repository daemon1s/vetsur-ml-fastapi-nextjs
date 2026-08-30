# Vetsur Analytics

Patient churn prediction and business intelligence platform for a veterinary clinic network. Combines an automated data cleaning and Random Forest classification API with an analytical monitoring dashboard.

<br>

<p align="center">
  <a href="https://vetsur.daemonize.me" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Live_Demo-vetsur.daemonize.me-05998B?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
  </a>
</p>

<br>

## System Architecture

```
[Raw Historical Data (CSV)] ---> [ETL & Training Pipeline (Jupyter/Colab)]
                                              |
                                              v (7-feature Random Forest model)
[Next.js 14 Dashboard] <--- REST / JSON ---> [FastAPI Inference API]
```

### Core Components

1. **Data Engineering & ETL Pipeline**:
   - **Text Normalization**: Resolves mojibake and character corruption in categorical variables using `ftfy`.
   - **Segmented Imputation**: Imputes missing medication costs using median values grouped by service type (`tipo_atencion`), preventing distortion from high-cost surgical procedures.
   - **Feature Selection**: Selects top 7 predictive features from Random Forest importance rankings (`dias_desde_ultima_visita`, `visitas_historicas`, `monto_cobrado`, `costo_medicamento`, `edad_mascota_anios`, `tiene_vacunas_al_dia`, `tipo_atencion_venta_producto`).

2. **Inference Engine (FastAPI)**:
   - Loads the serialized Joblib model and feature contract (`columnas_vetsur.json`) as a singleton during application startup.
   - Endpoints include single-patient churn inference (`POST /api/predecir`), batch risk assessment (`GET /api/pacientes-en-riesgo`), and branch-level summary statistics (`GET /api/estadisticas`).
   - Categorizes churn probability into risk tiers: High (>= 0.60), Medium (0.20 - 0.59), and Low (< 0.20).

3. **Analytics Dashboard (Next.js 14)**:
   - Operational KPI summaries and volume distributions by branch and species via Recharts.
   - Patient risk table with search, category filtering, pagination, and client-side CSV export using `@tanstack/react-table`.
   - Interactive prediction form for ad-hoc risk evaluation.

## Tech Stack

- **Backend / Machine Learning**: Python 3.11, FastAPI, Scikit-learn, Pandas, NumPy, Joblib, Pydantic v2, ftfy
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, TanStack Table, Framer Motion
- **Infrastructure**: Docker Compose, Nginx

## Project Structure

```
vetsur/
├── api/
│   ├── main.py                     # FastAPI application endpoints
│   ├── modelo.py                   # Model loader and inference logic
│   ├── esquemas.py                 # Pydantic validation schemas
│   ├── modelo_vetsur.pkl           # Trained Random Forest model binary
│   ├── columnas_vetsur.json        # 7-feature model schema contract
│   ├── caso1_vetsur.csv            # Reference dataset
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages (/, /predictor, /arquitectura)
│   │   ├── components/             # Recharts visualizations and patient table
│   │   └── types/                  # TypeScript interface contracts
│   ├── Dockerfile
│   └── package.json
├── notebooks/
│   └── vetsur.ipynb                # Exploratory analysis and training notebook
└── docker-compose.yml
```

## Local Setup

### Prerequisites
- Docker and Docker Compose (or Python 3.11+ and Node.js 20+)

### Running with Docker

```bash
# Clone the repository
git clone https://github.com/daemon1s/vetsur-ml-fastapi-nextjs.git
cd vetsur-ml-fastapi-nextjs

# Start services
docker compose up -d --build
```

Access points:
- Dashboard: `http://localhost:3000`
- FastAPI Documentation: `http://localhost:8008/docs`

### Manual Development Setup

```bash
# 1. Start backend
cd api
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8008 --reload

# 2. Start frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev
```
