import io
import csv
import json
from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Report, ReportAnalysis, Alert, AuditLog, utcnow
from app.ai.sif_classifier import sif_classifier
from app.ai.rules_classifier import rules_classifier
from app.ai.entity_extractor import entity_extractor
from app.ai.risk_scorer import risk_scoring_engine
from app.ai.explainability import explainability_engine

router = APIRouter()

class ImportExecuteRequest(BaseModel):
    records: List[Dict[str, Any]]
    column_mapping: Dict[str, str]

@router.post("/preview")
async def preview_upload(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()
    
    records = []
    headers = []
    
    if filename.endswith(".json"):
        try:
            data = json.loads(contents.decode("utf-8"))
            if isinstance(data, list):
                records = data[:10]
                if records:
                    headers = list(records[0].keys())
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")
    else:
        # CSV parsing
        try:
            text = contents.decode("utf-8-sig", errors="ignore")
            reader = csv.DictReader(io.StringIO(text))
            headers = reader.fieldnames or []
            for idx, row in enumerate(reader):
                if idx >= 10:
                    break
                records.append(row)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    return {
        "filename": file.filename,
        "headers": headers,
        "preview_records": records,
        "sample_size": len(records)
    }

@router.post("/execute")
def execute_import(payload: ImportExecuteRequest, db: Session = Depends(get_db)):
    records = payload.records
    mapping = payload.column_mapping
    
    imported_count = 0
    sif_detected_count = 0
    errors = []

    for idx, raw_item in enumerate(records):
        desc = raw_item.get(mapping.get("description", "raw_description"), "")
        if not desc or len(str(desc).strip()) < 10:
            errors.append(f"Row {idx+1}: Description too short or missing")
            continue

        site_name = raw_item.get(mapping.get("site", "site_name"), "Duliajan Central Field")
        report_type = raw_item.get(mapping.get("report_type", "report_type"), "Unsafe Condition")
        activity = raw_item.get(mapping.get("activity", "activity"), "Maintenance")
        location = raw_item.get(mapping.get("location", "location"), "Plant Area")
        equipment = raw_item.get(mapping.get("equipment", "equipment"), "General Machinery")
        worker_role = raw_item.get(mapping.get("worker_role", "worker_role"), "Technician")

        # Run AI
        meta = {"activity": activity, "location": location, "equipment": equipment, "worker_role": worker_role}
        entities = entity_extractor.extract(desc, meta)
        rule_results = rules_classifier.classify(desc)
        sif_res = sif_classifier.predict(desc)
        risk_res = risk_scoring_engine.calculate_risk(
            sif_probability=sif_res["sif_probability"],
            consequences=entities.get("potential_consequences", []),
            barrier_failures=entities.get("barrier_failures", []),
            rules=rule_results,
            activity=entities.get("activity", activity)
        )
        explain_res = explainability_engine.explain(
            text=desc,
            sif_prob=sif_res["sif_probability"],
            is_sif=sif_res["sif_prediction"],
            top_tokens=sif_res.get("top_features", []),
            rules=rule_results,
            entities=entities
        )

        curr_count = db.query(Report).count() + 1001 + imported_count
        rep_uid = f"OIL-2026-{curr_count}"

        new_report = Report(
            report_uid=rep_uid,
            report_type=report_type,
            site_name=site_name,
            department_name="Operations",
            location=entities.get("location") or location,
            activity=entities.get("activity") or activity,
            equipment=entities.get("equipment") or equipment,
            worker_role=entities.get("worker_role") or worker_role,
            raw_description=desc,
            status="Analyzed",
            severity=risk_res["risk_level"],
            risk_score=risk_res["risk_score"],
            sif_potential=sif_res["sif_prediction"],
            sif_probability=sif_res["sif_probability"],
            created_at=utcnow()
        )
        db.add(new_report)
        db.flush()

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
            similar_reports=[],
            analyzed_at=utcnow()
        )
        db.add(new_analysis)

        imported_count += 1
        if sif_res["sif_prediction"]:
            sif_detected_count += 1

    audit = AuditLog(
        user_email="admin@oil-demo.com",
        action="DATA_IMPORT",
        entity_type="BATCH",
        entity_id=f"BATCH-{utcnow().strftime('%Y%m%d%H%M')}",
        details={"imported": imported_count, "sif_detected": sif_detected_count, "errors_count": len(errors)}
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "imported_count": imported_count,
        "sif_detected_count": sif_detected_count,
        "errors": errors
    }
