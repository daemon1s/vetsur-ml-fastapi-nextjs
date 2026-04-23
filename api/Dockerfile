FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar algunas librerías si es necesario, 
# aunque scikit-learn y pandas usualmente proveen wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# El puerto 8008 es el expuesto en docker-compose
EXPOSE 8008

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8008", "--workers", "1"]
