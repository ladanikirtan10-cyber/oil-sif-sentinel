from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.database.models import Report, ReportAnalysis, HumanReview, User, AuditLog, utcnow
from app.schemas.schemas import HumanReviewCreate

router = APIRouter()

@router.get("/queue")
def get_review_queue(db: Session = Depends(get_db)):
    # Reports pending validation or high-potential items
    reports = db.query(Report).filter(
        Report.status.in_(["Analyzed", "In Review"])
    ).order_by(desc(Report.sif_probability)).limit(50).all()

    queue = []
    for r in reports:
        analysis = r.analysis
        queue.append({
            "report_id": r.id,
            "report_uid": r.report_uid,
            "date": r.date_time,
            "site_name": r.site_name,
            "activity": r.activity,
            "raw_description": r.raw_description,
            "ai_sif_prediction": r.sif_potential,
            "sif_probability": r.sif_probability,
            "confidence": analysis.confidence if analysis else 0.85,
            "risk_level": r.severity,
            "risk_score": r.risk_score,
            "rules": analysis.rule_signals if analysis else [],
            "entities": analysis.entity_extraction if analysis else {}
        })

    return {
        "total_in_queue": len(queue),
        "items": queue
    }

@router.post("/{report_id}/validate")
def submit_review(report_id: int, payload: HumanReviewCreate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    analysis = report.analysis
    original_sif = report.sif_potential
    original_risk = report.severity

    # Update report
    report.sif_potential = payload.reviewed_sif
    report.severity = payload.reviewed_risk
    report.status = "Validated"
    
    if analysis:
        analysis.sif_prediction = payload.reviewed_sif
        analysis.risk_level = payload.reviewed_risk
        if payload.edited_entities:
            analysis.entity_extraction = payload.edited_entities

    # Record HumanReview
    review_record = HumanReview(
        report_id=report.id,
        reviewer_id=1,  # HSE Officer
        reviewer_name="R. K. Sharma (Lead HSE Officer)",
        original_sif=original_sif,
        reviewed_sif=payload.reviewed_sif,
        original_risk=original_risk,
        reviewed_risk=payload.reviewed_risk,
        edited_rules=payload.edited_rules or [],
        edited_entities=payload.edited_entities or {},
        review_comment=payload.review_comment or "Validated by HSE team during daily shift review.",
        status=payload.status,
        reviewed_at=utcnow()
    )
    db.add(review_record)

    # Audit Log
    audit = AuditLog(
        user_email="hse@oil-demo.com",
        action="HUMAN_REVIEW",
        entity_type="REPORT",
        entity_id=report.report_uid,
        details={
            "original_sif": original_sif,
            "reviewed_sif": payload.reviewed_sif,
            "decision": payload.status
        }
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": f"Report {report.report_uid} review recorded successfully",
        "report_uid": report.report_uid,
        "final_sif": report.sif_potential,
        "final_risk": report.severity
    }
