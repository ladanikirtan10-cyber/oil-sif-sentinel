from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.database.session import engine, Base, SessionLocal
from app.database import models
from app.ai.sif_classifier import sif_classifier

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB schema is created
    Base.metadata.create_all(bind=engine)
    
    # Initialize basic seed data if empty
    db = SessionLocal()
    try:
        from scripts.seed_bootstrap import bootstrap_database
        bootstrap_database(db)
    except Exception as e:
        print(f"Bootstrap note: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_SUBTITLE} — SIH26165 Production Implementation",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "product": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "version": settings.VERSION,
        "status": "online",
        "api_docs": "/docs",
        "api_prefix": settings.API_V1_STR
    }

@app.get("/health")
def health():
    try:
        from app.database.session import SessionLocal
        from app.database.models import ModelVersion
        with SessionLocal() as db_sess:
            active = db_sess.query(ModelVersion).filter(ModelVersion.is_active == True).order_by(ModelVersion.id.desc()).first()
            if active:
                return {"status": "healthy", "model_version": active.version_tag}
    except Exception:
        pass
    return {"status": "healthy", "model_version": sif_classifier.version}
