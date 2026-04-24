# Nota: Usamos una imagen ligera de Python 3.11 para construir nuestro contenedor.
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

# Nota: Exponemos el puerto 8008 para que el servidor Nginx pueda comunicarse con FastAPI.
EXPOSE 8008

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8008", "--workers", "1"]
