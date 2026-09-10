import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.database.session import get_db
from app.database.models import Report, ReportAnalysis, LifeSavingRule, ReportRuleMapping, Alert, AuditLog, utcnow
from app.schemas.schemas import ReportCreate, ReportResponse, ReportDetailResponse
from app.ai.sif_classifier import sif_classifier
from app.ai.rules_classifier import rules_classifier
from app.ai.entity_extractor import entity_extractor
from app.ai.explainability import explainability_engine
from app.ai.risk_scorer import risk_scoring_engine
from app.ai.semantic_engine import semantic_engine

router = APIRouter()

@router.get("", response_model=dict)
def list_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    site: Optional[str] = None,
    report_type: Optional[str] = None,
    sif: Optional[bool] = None,
    severity: Optional[str] = None,
    activity: Optional[str] = None,
    rule: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Report.report_uid.ilike(search_fmt),
                Report.raw_description.ilike(search_fmt),
                Report.location.ilike(search_fmt),
                Report.equipment.ilike(search_fmt),
                Report.activity.ilike(search_fmt)
            )
        )
    if site and site != "ALL":
        query = query.filter(Report.site_name.ilike(f"%{site}%"))
    if report_type and report_type != "ALL":
        query = query.filter(Report.report_type == report_type)
    if sif is not None:
        query = query.filter(Report.sif_potential == sif)
    if severity and severity != "ALL":
        query = query.filter(Report.severity == severity)
    if activity and activity != "ALL":
        query = query.filter(Report.activity == activity)

    total = query.count()
    reports = query.order_by(desc(Report.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for r in reports:
        items.append({
            "id": r.id,
            "report_uid": r.report_uid,
            "report_type": r.report_type,
            "site_name": r.site_name,
            "department_name": r.department_name,
            "date_time": r.date_time,
            "location": r.location,
            "activity": r.activity,
            "equipment": r.equipment,
            "worker_role": r.worker_role,
            "shift": r.shift,
            "contractor_involved": r.contractor_involved,
            "contractor_name": r.contractor_name,
            "raw_description": r.raw_description,
            "status": r.status,
            "severity": r.severity,
            "risk_score": r.risk_score,
            "sif_potential": r.sif_potential,
            "sif_probability": r.sif_probability,
            "created_at": r.created_at
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.post("", response_model=dict)
def create_report(payload: ReportCreate, db: Session = Depends(get_db)):
    # 1. Generate unique UID
    from sqlalchemy import func
    max_id = db.query(func.max(Report.id)).scalar() or 0
    report_uid = f"OIL-2026-{1000 + max_id + 1}"

    # 2. Run AI pipeline
    meta = {
        "activity": payload.activity,
        "location": payload.location,
        "equipment": payload.equipment,
        "worker_role": payload.worker_role,
        "shift": payload.shift,
        "department_name": payload.department_name,
        "contractor_involved": payload.contractor_involved
    }
    
    # NLP entity extraction
    entities = entity_extractor.extract(payload.raw_description, meta)
    
    # Life-Saving Rules
    rule_results = rules_classifier.classify(payload.raw_description)
    
    # SIF Classification
    sif_res = sif_classifier.predict(payload.raw_description)
    
    # Risk Scoring
    risk_res = risk_scoring_engine.calculate_risk(
        sif_probability=sif_res["sif_probability"],
        consequences=entities.get("potential_consequences", []),
        barrier_failures=entities.get("barrier_failures", []),
        rules=rule_results,
        activity=entities.get("activity", payload.activity),
        is_incident=(payload.report_type == "Incident")
    )
    
    # Explainability
    explain_res = explainability_engine.explain(
        text=payload.raw_description,
        sif_prob=sif_res["sif_probability"],
        is_sif=sif_res["sif_prediction"],
        top_tokens=sif_res.get("top_features", []),
        rules=rule_results,
        entities=entities
    )

    # Similar reports
    existing_reps = db.query(Report).limit(100).all()
    candidate_data = [{
        "report_uid": r.report_uid,
        "date_time": r.date_time,
        "site_name": r.site_name,
        "activity": r.activity,
        "sif_potential": r.sif_potential,
        "risk_score": r.risk_score,
        "raw_description": r.raw_description
    } for r in existing_reps]
    similar_reps = semantic_engine.find_similar(payload.raw_description, candidate_data, top_k=4)

    # 3. Create Report in DB
    new_report = Report(
        report_uid=report_uid,
        report_type=payload.report_type,
        site_name=payload.site_name,
        department_name=payload.department_name,
        date_time=payload.date_time or utcnow(),
        location=entities.get("location") or payload.location,
        activity=entities.get("activity") or payload.activity,
        equipment=entities.get("equipment") or payload.equipment,
        worker_role=entities.get("worker_role") or payload.worker_role,
        shift=payload.shift,
        contractor_involved=payload.contractor_involved or entities.get("contractor_involved", False),
        contractor_name=payload.contractor_name,
        raw_description=payload.raw_description,
        status="Analyzed",
        severity=risk_res["risk_level"],
        risk_score=risk_res["risk_score"],
        sif_potential=sif_res["sif_prediction"],
        sif_probability=sif_res["sif_probability"],
        created_at=utcnow()
    )
    db.add(new_report)
    db.flush()

    # 4. Create ReportAnalysis in DB
    new_analysis = ReportAnalysis(
        report_id=new_report.id,
        sif_prediction=sif_res["sif_prediction"],
        sif_probability=sif_res["sif_probability"],
        confidence=sif_res["confidence"],
        risk_score=risk_res["risk_score"],
        risk_level=risk_res["risk_level"],
        likelihood_score=risk_res["likelihood"],
        severity_score=risk_res["severity"],
        model_version=sif_res["model_version"],
        rule_signals=rule_results,
        entity_extraction=entities,
        explainability=explain_res,
        similar_reports=similar_reps,
        analyzed_at=utcnow()
    )
    db.add(new_analysis)

    # 5. Automatically create Alert if Critical or SIF Potential
    if sif_res["sif_prediction"] or risk_res["risk_level"] in ["CRITICAL", "HIGH"]:
        alt_count = db.query(Alert).count() + 1
        alt_uid = f"ALT-2026-{alt_count:04d}"
        alert_title = f"CRITICAL SIF PRECURSOR: {entities.get('activity')} at {payload.site_name}"
        alert_desc = f"SIF Probability {int(sif_res['sif_probability']*100)}% ({risk_res['risk_level']}). Primary barrier failure: {entities.get('barrier_failures', [''])[0]}"
        
        new_alert = Alert(
            alert_uid=alt_uid,
            title=alert_title,
            description=alert_desc,
            priority="CRITICAL" if risk_res["risk_level"] == "CRITICAL" else "HIGH",
            status="OPEN",
            report_id=new_report.id,
            site_name=payload.site_name,
            activity=entities.get("activity") or payload.activity,
            hazard=entities.get("hazards", ["Hazard"])[0],
            sif_probability=sif_res["sif_probability"],
            assigned_to="Lead HSE Officer",
            created_at=utcnow()
        )
        db.add(new_alert)

    # 6. Audit Log
    audit = AuditLog(
        user_email="hse@oil-demo.com",
        action="REPORT_CREATE",
        entity_type="REPORT",
        entity_id=report_uid,
        details={"sif": sif_res["sif_prediction"], "risk": risk_res["risk_level"]}
    )
    db.add(audit)
    db.commit()
    db.refresh(new_report)

    return {
        "report_id": new_report.id,
        "report_uid": new_report.report_uid,
        "sif_potential": new_report.sif_potential,
        "sif_probability": new_report.sif_probability,
        "risk_level": new_report.severity,
        "risk_score": new_report.risk_score,
        "analysis": {
            "sif_prediction": sif_res["sif_prediction"],
            "sif_probability": sif_res["sif_probability"],
            "confidence": sif_res["confidence"],
            "risk_score": risk_res["risk_score"],
            "risk_level": risk_res["risk_level"],
            "rule_signals": rule_results,
            "entity_extraction": entities,
            "explainability": explain_res,
            "similar_reports": similar_reps
        }
    }

@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    analysis = db.query(ReportAnalysis).filter(ReportAnalysis.report_id == report.id).first()
    reviews = report.reviews or []

    analysis_data = None
    if analysis:
        analysis_data = {
            "id": analysis.id,
            "sif_prediction": analysis.sif_prediction,
            "sif_probability": analysis.sif_probability,
            "confidence": analysis.confidence,
            "risk_score": analysis.risk_score,
            "risk_level": analysis.risk_level,
            "likelihood_score": analysis.likelihood_score,
            "severity_score": analysis.severity_score,
            "model_version": analysis.model_version,
            "rule_signals": analysis.rule_signals,
            "entity_extraction": analysis.entity_extraction,
            "explainability": analysis.explainability,
            "similar_reports": analysis.similar_reports,
            "analyzed_at": analysis.analyzed_at
        }

    reviews_data = [{
        "id": r.id,
        "reviewer_name": r.reviewer_name,
        "original_sif": r.original_sif,
        "reviewed_sif": r.reviewed_sif,
        "original_risk": r.original_risk,
        "reviewed_risk": r.reviewed_risk,
        "edited_rules": r.edited_rules,
        "edited_entities": r.edited_entities,
        "review_comment": r.review_comment,
        "status": r.status,
        "reviewed_at": r.reviewed_at
    } for r in reviews]

    return {
        "id": report.id,
        "report_uid": report.report_uid,
        "report_type": report.report_type,
        "site_name": report.site_name,
        "department_name": report.department_name,
        "date_time": report.date_time,
        "location": report.location,
        "activity": report.activity,
        "equipment": report.equipment,
        "worker_role": report.worker_role,
        "shift": report.shift,
        "contractor_involved": report.contractor_involved,
        "contractor_name": report.contractor_name,
        "raw_description": report.raw_description,
        "status": report.status,
        "severity": report.severity,
        "risk_score": report.risk_score,
        "sif_potential": report.sif_potential,
        "sif_probability": report.sif_probability,
        "created_at": report.created_at,
        "analysis": analysis_data,
        "reviews": reviews_data
    }
