FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "python 01_data_ingestion.py && python app.py"]
