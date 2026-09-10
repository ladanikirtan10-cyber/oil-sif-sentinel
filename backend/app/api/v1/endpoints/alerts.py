from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import Alert, AuditLog, utcnow
from app.schemas.schemas import AlertResponse

router = APIRouter()

class AlertActionRequest(BaseModel):
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    site: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if priority and priority != "ALL":
        query = query.filter(Alert.priority == priority)
    if status and status != "ALL":
        query = query.filter(Alert.status == status)
    if site and site != "ALL":
        query = query.filter(Alert.site_name.ilike(f"%{site}%"))

    alerts = query.order_by(desc(Alert.created_at)).all()
    return alerts

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, payload: AlertActionRequest, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "ACKNOWLEDGED"
    if payload.assigned_to:
        alert.assigned_to = payload.assigned_to
        
    audit = AuditLog(
        user_email="hse@oil-demo.com",
        action="ALERT_ACK",
        entity_type="ALERT",
        entity_id=alert.alert_uid,
        details={"status": "ACKNOWLEDGED", "assigned_to": alert.assigned_to}
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "alert_id": alert.id, "alert_status": alert.status}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, payload: AlertActionRequest, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "RESOLVED"
    alert.resolved_at = utcnow()
    alert.resolution_notes = payload.resolution_notes or "Operational isolation verified and corrective action completed."
    
    audit = AuditLog(
        user_email="hse@oil-demo.com",
        action="ALERT_RESOLVE",
        entity_type="ALERT",
        entity_id=alert.alert_uid,
        details={"notes": alert.resolution_notes}
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "alert_id": alert.id, "alert_status": alert.status}
