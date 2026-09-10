import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "OIL SIF SENTINEL"
    PROJECT_SUBTITLE: str = "AI-Powered Serious Injury & Fatality Precursor Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "oil-sif-sentinel-super-secure-production-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./oil_sif_sentinel.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # AI & Risk Thresholds (Configurable)
    SIF_THRESHOLD: float = 0.50
    SIF_CRITICAL_THRESHOLD: float = 0.75
    
    # Configurable Risk Scoring Weights
    WEIGHT_SIF_PROB: float = 0.35
    WEIGHT_SEVERITY: float = 0.25
    WEIGHT_EXPOSURE: float = 0.15
    WEIGHT_BARRIER: float = 0.15
    WEIGHT_RECURRENCE: float = 0.10
    
    # Demo Mode
    DEMO_MODE: bool = True
    MODEL_VERSION: str = "sif-sentinel-v1.4"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
