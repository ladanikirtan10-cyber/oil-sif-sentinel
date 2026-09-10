from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Report
from app.schemas.schemas import SemanticSearchRequest
from app.ai.semantic_engine import semantic_engine

router = APIRouter()

@router.post("/semantic")
def semantic_search(payload: SemanticSearchRequest, db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.id.desc()).limit(1000).all()
    reports_data = [{
        "id": r.id,
        "report_uid": r.report_uid,
        "date_time": r.date_time.strftime("%Y-%m-%d") if r.date_time else "",
        "site_name": r.site_name,
        "activity": r.activity,
        "equipment": r.equipment,
        "location": r.location,
        "severity": r.severity,
        "risk_score": r.risk_score,
        "sif_potential": r.sif_potential,
        "sif_probability": r.sif_probability,
        "raw_description": r.raw_description
    } for r in reports]

    matches = semantic_engine.search(payload.query, reports_data, top_k=payload.top_k)
    return {
        "query": payload.query,
        "total_matches": len(matches),
        "results": matches
    }

@router.get("/duplicates")
def check_duplicates(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.id.desc()).limit(150).all()
    reports_data = [{
        "id": r.id,
        "report_uid": r.report_uid,
        "date_time": r.date_time.strftime("%Y-%m-%d") if r.date_time else "",
        "site_name": r.site_name,
        "activity": r.activity,
        "raw_description": r.raw_description
    } for r in reports]

    duplicates = semantic_engine.detect_duplicates(reports_data, threshold=0.75)
    return {
        "total_duplicates_flagged": len(duplicates),
        "duplicate_pairs": duplicates
    }
