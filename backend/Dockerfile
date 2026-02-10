FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN python3 -m venv venv
RUN .venv/bin/activate
RUN pip install --no-cache-dir -r requirements.txt


RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser && \
    mkdir -p /app/media /app/staticfiles && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app/staticfiles /app/media

USER appuser

CMD ["gunicon", "wsgi:application", "--bind", "0.0.0.0:8000"]