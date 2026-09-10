from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import LifeSavingRule, Report
from app.schemas.schemas import LifeSavingRuleResponse
from app.ai.rules_classifier import LIFE_SAVING_RULES_DEFINITIONS

router = APIRouter()

@router.get("", response_model=List[LifeSavingRuleResponse])
def list_rules(db: Session = Depends(get_db)):
    rules = db.query(LifeSavingRule).all()
    if not rules:
        # Seed default definitions
        for defn in LIFE_SAVING_RULES_DEFINITIONS:
            rule = LifeSavingRule(
                code=defn["code"],
                name=defn["name"],
                category=defn["category"],
                icon=defn["icon"],
                description=defn["description"],
                criticality_weight=1.0,
                total_violations=28,
                sif_violations=14
            )
            db.add(rule)
        db.commit()
        rules = db.query(LifeSavingRule).all()
    return rules

@router.get("/{rule_code}")
def get_rule_details(rule_code: str, db: Session = Depends(get_db)):
    rule = db.query(LifeSavingRule).filter(LifeSavingRule.code == rule_code.upper()).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    matching_reports = db.query(Report).filter(
        Report.raw_description.ilike(f"%{rule.name.split()[0]}%")
    ).limit(8).all()

    return {
        "rule": {
            "id": rule.id,
            "code": rule.code,
            "name": rule.name,
            "category": rule.category,
            "icon": rule.icon,
            "description": rule.description,
            "criticality_weight": rule.criticality_weight,
            "total_violations": rule.total_violations,
            "sif_violations": rule.sif_violations,
            "sif_correlation_rate": round((rule.sif_violations / rule.total_violations * 100), 1) if rule.total_violations > 0 else 0.0
        },
        "reports": [{
            "report_uid": r.report_uid,
            "date": r.date_time,
            "site_name": r.site_name,
            "activity": r.activity,
            "sif_potential": r.sif_potential,
            "risk_score": r.risk_score,
            "raw_description": r.raw_description[:120] + "..."
        } for r in matching_reports]
    }
