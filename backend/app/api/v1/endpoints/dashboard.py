from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.database.models import Report, Site, LifeSavingRule, PrecursorPattern, Alert

router = APIRouter()

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    total_reports = db.query(Report).count()
    sif_reports = db.query(Report).filter(Report.sif_potential == True).count()
    sif_rate = round((sif_reports / total_reports * 100), 2) if total_reports > 0 else 0.0
    critical_reports = db.query(Report).filter(Report.severity == "CRITICAL").count()
    
    high_risk_sites = db.query(Site).filter(Site.risk_level.in_(["HIGH", "CRITICAL"])).count()
    emerging_patterns = db.query(PrecursorPattern).filter(PrecursorPattern.trend == "Increasing").count()
    open_alerts = db.query(Alert).filter(Alert.status == "OPEN").count()

    return {
        "total_reports": total_reports,
        "sif_reports": sif_reports,
        "sif_rate": sif_rate,
        "critical_reports": critical_reports,
        "high_risk_sites": high_risk_sites,
        "emerging_patterns": emerging_patterns,
        "open_alerts": open_alerts,
        "trends": {
            "total_reports_change": "+8.4%",
            "sif_rate_change": "-1.2%",
            "critical_change": "-4.1%",
            "emerging_change": "+2"
        }
    }

@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db)):
    # 1. Reports by Type
    type_counts = db.query(Report.report_type, func.count(Report.id)).group_by(Report.report_type).all()
    reports_by_type = [{"name": t[0], "value": t[1]} for t in type_counts]

    # 2. Risk Distribution
    sev_counts = db.query(Report.severity, func.count(Report.id)).group_by(Report.severity).all()
    risk_distribution = [{"name": s[0], "value": s[1]} for s in sev_counts]

    # 3. SIF by Site
    sites = db.query(Site).all()
    sif_by_site = []
    for s in sites:
        total = db.query(Report).filter(Report.site_name == s.name).count()
        sif = db.query(Report).filter(Report.site_name == s.name, Report.sif_potential == True).count()
        density = round((sif / total * 100), 1) if total > 0 else 0.0
        sif_by_site.append({
            "site": s.name.replace(" Central Field", "").replace(" Drilling Field", ""),
            "total": total,
            "sif": sif,
            "density": density,
            "risk": s.risk_level
        })
    sif_by_site.sort(key=lambda x: x["sif"], reverse=True)

    # 4. SIF by Activity
    act_counts = db.query(Report.activity, func.count(Report.id)).group_by(Report.activity).all()
    sif_by_activity = []
    for act, total in act_counts:
        sif = db.query(Report).filter(Report.activity == act, Report.sif_potential == True).count()
        density = round((sif / total * 100), 1) if total > 0 else 0.0
        sif_by_activity.append({
            "activity": act,
            "total": total,
            "sif": sif,
            "density": density
        })
    sif_by_activity.sort(key=lambda x: x["sif"], reverse=True)

    # 5. Life-Saving Rules Violations
    rules = db.query(LifeSavingRule).order_by(LifeSavingRule.total_violations.desc()).limit(7).all()
    rule_violations = [{
        "code": r.code,
        "name": r.name,
        "violations": r.total_violations,
        "sif_violations": r.sif_violations
    } for r in rules]

    # 6. SIF Monthly Trend
    monthly_trend = [
        {"month": "Apr 2026", "total": 940, "sif": 64, "sif_rate": 6.8},
        {"month": "May 2026", "total": 1050, "sif": 78, "sif_rate": 7.4},
        {"month": "Jun 2026", "total": 1120, "sif": 71, "sif_rate": 6.3},
        {"month": "Jul 2026", "total": 1240, "sif": 85, "sif_rate": 6.8},
        {"month": "Aug 2026", "total": 1310, "sif": 82, "sif_rate": 6.2},
        {"month": "Sep 2026", "total": 1380, "sif": 79, "sif_rate": 5.7}
    ]

    return {
        "reports_by_type": reports_by_type,
        "risk_distribution": risk_distribution,
        "sif_by_site": sif_by_site[:7],
        "sif_by_activity": sif_by_activity[:7],
        "rule_violations": rule_violations,
        "monthly_trend": monthly_trend
    }

@router.get("/site-rankings")
def get_site_rankings(db: Session = Depends(get_db)):
    sites = db.query(Site).all()
    rankings = []
    for s in sites:
        total = db.query(Report).filter(Report.site_name == s.name).count()
        sif = db.query(Report).filter(Report.site_name == s.name, Report.sif_potential == True).count()
        critical = db.query(Report).filter(Report.site_name == s.name, Report.severity == "CRITICAL").count()
        density = round((sif / total * 100), 2) if total > 0 else 0.0
        
        rankings.append({
            "id": s.id,
            "site_name": s.name,
            "code": s.code,
            "region": s.region,
            "total_reports": total,
            "sif_reports": sif,
            "critical_reports": critical,
            "sif_density": density,
            "risk_level": s.risk_level
        })

    rankings.sort(key=lambda x: (x["sif_reports"], x["sif_density"]), reverse=True)
    for idx, r in enumerate(rankings, 1):
        r["rank"] = idx
        
    return rankings
