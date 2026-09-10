from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.database.models import Report, Site, ReportAnalysis

router = APIRouter()

@router.get("/sites")
def get_site_analytics(db: Session = Depends(get_db)):
    sites = db.query(Site).all()
    results = []
    
    for s in sites:
        reps = db.query(Report).filter(Report.site_name == s.name).all()
        total = len(reps)
        sif = sum(1 for r in reps if r.sif_potential)
        critical = sum(1 for r in reps if r.severity == "CRITICAL")
        density = round((sif / total * 100), 2) if total > 0 else 0.0

        # Top hazard at site
        hazards = {}
        for r in reps:
            if r.analysis and r.analysis.entity_extraction:
                hz_list = r.analysis.entity_extraction.get("hazards", [])
                for h in hz_list:
                    hazards[h] = hazards.get(h, 0) + 1
        top_hazard = sorted(hazards.items(), key=lambda x: x[1], reverse=True)
        top_hazard_str = top_hazard[0][0] if top_hazard else "Mechanical Failure"

        results.append({
            "site_id": s.id,
            "site_name": s.name,
            "code": s.code,
            "region": s.region,
            "site_type": s.site_type,
            "total_reports": total,
            "sif_reports": sif,
            "critical_reports": critical,
            "sif_density": density,
            "risk_level": s.risk_level,
            "top_hazard": top_hazard_str
        })

    results.sort(key=lambda x: x["sif_density"], reverse=True)
    return results

@router.get("/activities")
def get_activity_analytics(db: Session = Depends(get_db)):
    activities = ["Maintenance", "Drilling", "Mechanical Lifting", "Hot Work", "Electrical Work", "Confined Space Entry", "Pipelining", "Workover"]
    results = []
    
    for act in activities:
        reps = db.query(Report).filter(Report.activity == act).all()
        total = len(reps)
        sif = sum(1 for r in reps if r.sif_potential)
        critical = sum(1 for r in reps if r.severity == "CRITICAL")
        density = round((sif / total * 100), 2) if total > 0 else 0.0
        
        results.append({
            "activity": act,
            "total_reports": total,
            "sif_reports": sif,
            "critical_reports": critical,
            "sif_density": density,
            "risk_tier": "CRITICAL" if density >= 20.0 else "HIGH" if density >= 10.0 else "MODERATE"
        })

    results.sort(key=lambda x: x["sif_density"], reverse=True)
    return results

@router.get("/risk-matrix")
def get_risk_matrix(db: Session = Depends(get_db)):
    analyses = db.query(ReportAnalysis).all()
    matrix = {}
    for l in range(1, 6):
        for s in range(1, 6):
            matrix[f"{l}_{s}"] = 0

    for a in analyses:
        l = a.likelihood_score or 2
        s = a.severity_score or 2
        key = f"{l}_{s}"
        matrix[key] = matrix.get(key, 0) + 1

    cells = []
    for l in range(1, 6):
        for s in range(1, 6):
            cells.append({
                "likelihood": l,
                "severity": s,
                "count": matrix.get(f"{l}_{s}", 0),
                "risk_tier": "CRITICAL" if (l*s >= 15 or s == 5) else "HIGH" if (l*s >= 10) else "MODERATE" if (l*s >= 6) else "LOW"
            })

    return {"cells": cells, "total_assessed": len(analyses)}
