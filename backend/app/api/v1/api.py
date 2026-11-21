from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    dashboard,
    reports,
    analysis,
    precursors,
    rules,
    analytics,
    search,
    assistant,
    reviews,
    models,
    alerts,
    imports,
    admin,
    camera
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["Safety Reports"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["AI Analysis Engine"])
api_router.include_router(camera.router, prefix="/camera", tags=["AI Safety Camera"])
api_router.include_router(precursors.router, prefix="/precursors", tags=["Precursor Intelligence"])
api_router.include_router(rules.router, prefix="/rules", tags=["Life-Saving Rules"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Risk Analytics"])
api_router.include_router(search.router, prefix="/search", tags=["Semantic Search & Duplicates"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Safety Assistant"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Human Review Queue"])
api_router.include_router(models.router, prefix="/models", tags=["Model Performance"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(imports.router, prefix="/import", tags=["Data Import Wizard"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & System Settings"])
