backend_dockerfile = """# OIL SIF SENTINEL - Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source & scripts
COPY backend/ ./backend/
COPY scripts/ ./scripts/

ENV PYTHONPATH=/app/backend
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

frontend_dockerfile = """# OIL SIF SENTINEL - Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Production server stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""

nginx_conf = """server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""

docker_compose_yml = """version: '3.8'

services:
  # PostgreSQL database for enterprise production mode
  postgres:
    image: pgvector/pgvector:pg16
    container_name: oil_sif_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-oil_sif_sentinel}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - oil_sif_net

  # Redis for background queue and caching
  redis:
    image: redis:7-alpine
    container_name: oil_sif_redis
    ports:
      - "6379:6379"
    networks:
      - oil_sif_net

  # FastAPI AI/NLP Backend
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    container_name: oil_sif_backend
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-oil_sif_sentinel}
      - SECRET_KEY=${SECRET_KEY:-oil-sif-sentinel-production-secret-key-2026}
      - DEMO_MODE=true
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - oil_sif_net

  # Next.js / Vite React Enterprise Frontend
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: oil_sif_frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - oil_sif_net

volumes:
  postgres_data:

networks:
  oil_sif_net:
    driver: bridge
"""

env_example = """# OIL SIF SENTINEL — Environment Configuration
# Project: Smart India Hackathon SIH26165

PROJECT_NAME="OIL SIF SENTINEL"
PROJECT_SUBTITLE="AI-Powered Serious Injury & Fatality Precursor Intelligence Platform"
VERSION="1.0.0"

# Security
SECRET_KEY="oil-sif-sentinel-production-secret-key-2026"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (SQLite default for zero-config demo, PostgreSQL for production)
DATABASE_URL="sqlite:///./oil_sif_sentinel.db"
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oil_sif_sentinel"

# PostgreSQL Docker Settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=oil_sif_sentinel

# AI Engine Settings
SIF_THRESHOLD=0.50
SIF_CRITICAL_THRESHOLD=0.75
MODEL_VERSION="sif-sentinel-v1.4"
DEMO_MODE=true
"""

import os
with open('docker/Dockerfile.backend', 'w', encoding='utf-8') as f:
    f.write(backend_dockerfile)
with open('docker/Dockerfile.frontend', 'w', encoding='utf-8') as f:
    f.write(frontend_dockerfile)
with open('docker/nginx.conf', 'w', encoding='utf-8') as f:
    f.write(nginx_conf)
with open('docker-compose.yml', 'w', encoding='utf-8') as f:
    f.write(docker_compose_yml)
with open('.env.example', 'w', encoding='utf-8') as f:
    f.write(env_example)

print('Created Dockerfile.backend, Dockerfile.frontend, nginx.conf, docker-compose.yml, and .env.example.')
