from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database.session import get_db
from app.database.models import Report, Alert, AuditLog, utcnow
from app.ai.vision_detector import vision_engine

router = APIRouter()

class CameraDetectRequest(BaseModel):
    image_base64: str
    camera_id: Optional[str] = "CAM-01"
    camera_name: Optional[str] = "Rig 04 Main Drill Floor"
    site_name: Optional[str] = "Duliajan Central Field"
    location: Optional[str] = "Drilling Rig Floor 04"
    auto_record: Optional[bool] = True
    danger_zone_active: Optional[bool] = False

@router.get("/cameras")
def get_cameras():
    """List all registered industrial safety cameras."""
    return vision_engine.cameras

@router.get("/stats")
def get_camera_stats(db: Session = Depends(get_db)):
    """Summary statistics for camera-based automated safety surveillance."""
    total_camera_reports = db.query(Report).filter(Report.report_type.ilike("%Camera%")).count()
    open_camera_alerts = db.query(Alert).filter(Alert.title.ilike("%Camera%"), Alert.status == "OPEN").count()
    
    return {
        "active_cameras_count": len(vision_engine.cameras),
        "total_violations_intercepted": total_camera_reports,
        "active_open_alerts": open_camera_alerts,
        "system_status": "ONLINE",
        "fps_capability": "15-30 FPS Real-Time",
        "vision_models": ["Adaptive Skin Chrominance YCrCb", "Color-Space HSV PPE Filters", "Restricted Danger Zone Perimeters"],
        "supported_ppe": ["Hard Hat / Safety Helmet", "High-Visibility Reflective Vest", "Danger Zone Intrusion"]
    }

@router.post("/detect")
def detect_camera_frame(payload: CameraDetectRequest, db: Session = Depends(get_db)):
    """
    Core AI inference endpoint:
    1. Decodes incoming camera or uploaded image frame
    2. Detects workers dynamically and evaluates PPE (helmet, vest, restricted zone)
    3. If violation confirmed:
       - Checks cooldown / de-duplication window (30s)
       - Automatically records official Report and Alert in DB
    4. Returns structured detection result, bounding boxes, annotations, and created record IDs
    """
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="Missing image_base64 data.")

    try:
        img_bgr = vision_engine.decode_image(payload.image_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

    # 1. Run Computer Vision inference
    result = vision_engine.detect_frame(
        img_bgr=img_bgr,
        camera_id=payload.camera_id,
        location=payload.location,
        site_name=payload.site_name,
        danger_zone_active=payload.danger_zone_active or False
    )

    incident_created = False
    cooldown_active = False
    report_id = None
    report_uid = None
    alert_uid = None

    # 2. Automated Violation Workflow (Zero-touch requirement)
    if result["status"] == "violation" and payload.auto_record and len(result["violations"]) > 0:
        primary_violation = result["violations"][0]
        v_type = primary_violation["type"]

        cooldown_active = vision_engine.check_and_apply_cooldown(payload.camera_id, v_type)

        if not cooldown_active:
            max_rep_id = db.query(func.max(Report.id)).scalar() or 0
            report_uid = f"OIL-CAM-2026-{1000 + max_rep_id + 1}"

            max_alt_id = db.query(func.max(Alert.id)).scalar() or 0
            alert_uid = f"ALT-CAM-2026-{1000 + max_alt_id + 1}"

            viol_descriptions = " • ".join([f"{v['title']}: {v['description']}" for v in result["violations"]])
            raw_desc = (
                f"Automated AI Camera Surveillance Alert on {payload.camera_name or payload.camera_id} ({payload.camera_id}). "
                f"Location: {payload.location}, Site: {payload.site_name}. "
                f"Detected {result['persons_detected_count']} worker(s) with {len(result['violations'])} safety violation(s): "
                f"{viol_descriptions}. Immediate field safety officer intervention required."
            )

            is_sif = (result["max_severity"] in ["CRITICAL", "HIGH"])
            sif_prob = 0.94 if result["max_severity"] == "CRITICAL" else (0.86 if result["max_severity"] == "HIGH" else 0.65)
            risk_score = 4.8 if result["max_severity"] == "CRITICAL" else (3.9 if result["max_severity"] == "HIGH" else 2.6)

            new_report = Report(
                report_uid=report_uid,
                report_type="Camera AI Safety Violation",
                site_name=payload.site_name,
                department_name="Operations & Drilling",
                date_time=utcnow(),
                location=payload.location,
                activity="Automated Visual PPE Surveillance",
                equipment=f"{payload.camera_name} ({payload.camera_id})",
                worker_role="Field Technician / Contractor",
                shift="Morning",
                contractor_involved=True,
                contractor_name="Active Contractor Field Team",
                raw_description=raw_desc,
                status="Analyzed",
                severity=result["max_severity"],
                risk_score=risk_score,
                sif_potential=is_sif,
                sif_probability=sif_prob,
                created_at=utcnow()
            )
            db.add(new_report)
            db.flush()

            report_id = new_report.id

            new_alert = Alert(
                alert_uid=alert_uid,
                title=f"CAMERA AI ALERT: {primary_violation['title']} at {payload.location}",
                description=viol_descriptions,
                priority="CRITICAL" if result["max_severity"] == "CRITICAL" else "HIGH",
                status="OPEN",
                report_id=new_report.id,
                site_name=payload.site_name,
                activity="Automated Visual Surveillance",
                hazard=primary_violation.get("type", "PPE Violation").replace("_", " ").title(),
                sif_probability=sif_prob,
                assigned_to="Lead HSE Officer",
                created_at=utcnow()
            )
            db.add(new_alert)

            audit = AuditLog(
                user_email="camera-ai@oilindia.in",
                action="CAMERA_VIOLATION_DETECTED",
                entity_type="CAMERA",
                entity_id=payload.camera_id,
                details={
                    "report_uid": report_uid,
                    "alert_uid": alert_uid,
                    "violations": [v["type"] for v in result["violations"]],
                    "location": payload.location
                },
                created_at=utcnow()
            )
            db.add(audit)

            db.commit()
            incident_created = True

    result["incident_created"] = incident_created
    result["cooldown_active"] = cooldown_active
    result["report_id"] = report_id
    result["report_uid"] = report_uid
    result["alert_uid"] = alert_uid

    return result
