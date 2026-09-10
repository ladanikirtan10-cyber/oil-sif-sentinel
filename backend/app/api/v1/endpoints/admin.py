from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import User, AuditLog, SystemSetting, utcnow
from app.core.config import settings

router = APIRouter()

class SettingsUpdateRequest(BaseModel):
    sif_threshold: Optional[float] = None
    sif_critical_threshold: Optional[float] = None
    weight_sif_prob: Optional[float] = None
    weight_severity: Optional[float] = None
    weight_exposure: Optional[float] = None
    weight_barrier: Optional[float] = None
    weight_recurrence: Optional[float] = None

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "role": u.role,
        "site": u.site,
        "department": u.department,
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]

@router.get("/audit-logs")
def list_audit_logs(
    action: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action and action != "ALL":
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(desc(AuditLog.created_at)).limit(limit).all()
    
    return [{
        "id": l.id,
        "user_email": l.user_email,
        "action": l.action,
        "entity_type": l.entity_type,
        "entity_id": l.entity_id,
        "details": l.details,
        "created_at": l.created_at
    } for l in logs]

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    db_settings = db.query(SystemSetting).all()
    settings_dict = {s.setting_key: s.setting_value for s in db_settings}

    return {
        "sif_threshold": settings_dict.get("sif_threshold", settings.SIF_THRESHOLD),
        "sif_critical_threshold": settings_dict.get("sif_critical_threshold", settings.SIF_CRITICAL_THRESHOLD),
        "weights": {
            "sif_probability": settings_dict.get("weight_sif_prob", settings.WEIGHT_SIF_PROB),
            "severity": settings_dict.get("weight_severity", settings.WEIGHT_SEVERITY),
            "exposure": settings_dict.get("weight_exposure", settings.WEIGHT_EXPOSURE),
            "barrier_failure": settings_dict.get("weight_barrier", settings.WEIGHT_BARRIER),
            "recurrence": settings_dict.get("weight_recurrence", settings.WEIGHT_RECURRENCE)
        },
        "model_version": settings.MODEL_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "oil_sites_configured": 7,
        "life_saving_rules_active": 9
    }

@router.put("/settings")
def update_settings(payload: SettingsUpdateRequest, db: Session = Depends(get_db)):
    def upsert(key, val):
        rec = db.query(SystemSetting).filter(SystemSetting.setting_key == key).first()
        if rec:
            rec.setting_value = val
            rec.updated_at = utcnow()
        else:
            db.add(SystemSetting(setting_key=key, setting_value=val, description="Config parameter"))

    if payload.sif_threshold is not None:
        upsert("sif_threshold", payload.sif_threshold)
        settings.SIF_THRESHOLD = payload.sif_threshold
    if payload.sif_critical_threshold is not None:
        upsert("sif_critical_threshold", payload.sif_critical_threshold)
        settings.SIF_CRITICAL_THRESHOLD = payload.sif_critical_threshold
    if payload.weight_sif_prob is not None:
        upsert("weight_sif_prob", payload.weight_sif_prob)
        settings.WEIGHT_SIF_PROB = payload.weight_sif_prob
    if payload.weight_severity is not None:
        upsert("weight_severity", payload.weight_severity)
        settings.WEIGHT_SEVERITY = payload.weight_severity

    db.add(AuditLog(
        user_email="admin@oil-demo.com",
        action="SETTINGS_UPDATE",
        entity_type="SYSTEM",
        entity_id="GLOBAL_CONFIG",
        details=payload.model_dump(exclude_none=True)
    ))
    db.commit()

    return {"status": "success", "message": "System settings updated successfully"}
