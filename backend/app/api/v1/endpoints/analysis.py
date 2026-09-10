from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Report
from app.schemas.schemas import AnalyzeTextRequest, AnalysisResult
from app.ai.sif_classifier import sif_classifier
from app.ai.rules_classifier import rules_classifier
from app.ai.entity_extractor import entity_extractor
from app.ai.explainability import explainability_engine
from app.ai.risk_scorer import risk_scoring_engine
from app.ai.semantic_engine import semantic_engine

router = APIRouter()

@router.post("/evaluate", response_model=AnalysisResult)
def evaluate_text(payload: AnalyzeTextRequest, db: Session = Depends(get_db)):
    meta = {
        "activity": payload.activity,
        "location": payload.location,
        "equipment": payload.equipment,
        "worker_role": payload.worker_role,
        "contractor_involved": payload.contractor_involved
    }

    # 1. Entity extraction
    entities = entity_extractor.extract(payload.raw_description, meta)
    
    # 2. Rules classification
    rule_results = rules_classifier.classify(payload.raw_description)
    
    # 3. SIF ML prediction
    sif_res = sif_classifier.predict(payload.raw_description)
    
    # 4. Risk scoring
    risk_res = risk_scoring_engine.calculate_risk(
        sif_probability=sif_res["sif_probability"],
        consequences=entities.get("potential_consequences", []),
        barrier_failures=entities.get("barrier_failures", []),
        rules=rule_results,
        activity=entities.get("activity", payload.activity or "Maintenance")
    )
    
    # 5. Explainability
    explain_res = explainability_engine.explain(
        text=payload.raw_description,
        sif_prob=sif_res["sif_probability"],
        is_sif=sif_res["sif_prediction"],
        top_tokens=sif_res.get("top_features", []),
        rules=rule_results,
        entities=entities
    )

    # 6. Find similar from existing DB reports
    existing_reps = db.query(Report).limit(50).all()
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

    return {
        "sif_prediction": sif_res["sif_prediction"],
        "sif_probability": sif_res["sif_probability"],
        "confidence": sif_res["confidence"],
        "risk_score": risk_res["risk_score"],
        "risk_level": risk_res["risk_level"],
        "likelihood_score": risk_res["likelihood"],
        "severity_score": risk_res["severity"],
        "model_version": sif_res["model_version"],
        "rule_signals": rule_results,
        "entity_extraction": entities,
        "explainability": explain_res,
        "similar_reports": similar_reps
    }
