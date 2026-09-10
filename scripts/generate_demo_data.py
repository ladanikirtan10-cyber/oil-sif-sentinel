import os
import sys
import random
import argparse
from datetime import datetime, timedelta, timezone

# Ensure project backend is in path
sys.path.append(os.path.abspath("backend"))

from sqlalchemy import func
from app.database.session import SessionLocal, engine, Base
from app.database.models import (
    User, Site, Department, LifeSavingRule, Report, ReportAnalysis,
    ReportRuleMapping, PrecursorPattern, Alert, HumanReview, ModelVersion, AuditLog, utcnow
)
from app.core.security import get_password_hash
from app.ai.rules_classifier import LIFE_SAVING_RULES_DEFINITIONS
from app.ai.sif_classifier import sif_classifier
from app.ai.rules_classifier import rules_classifier
from app.ai.entity_extractor import entity_extractor
from app.ai.risk_scorer import risk_scoring_engine
from app.ai.explainability import explainability_engine
from app.ai.precursor_miner import precursor_miner

SITES_DATA = [
    {"code": "OIL-DUL", "name": "Duliajan Central Field", "region": "Assam Asset", "site_type": "Headquarters & Gas Processing", "risk_level": "CRITICAL"},
    {"code": "OIL-MOR", "name": "Moran Drilling Field", "region": "Assam Asset", "site_type": "Drilling & Deep Exploration", "risk_level": "HIGH"},
    {"code": "OIL-DIG", "name": "Digboi Production Area", "region": "Assam Asset", "site_type": "Crude Oil Production & Processing", "risk_level": "MODERATE"},
    {"code": "OIL-NHK", "name": "Naharkatiya Gas Station", "region": "Assam Asset", "site_type": "Gas Gathering & Compression", "risk_level": "HIGH"},
    {"code": "OIL-JOR", "name": "Jorhat Exploration Project", "region": "Assam Asset", "site_type": "Workover & Wellhead Services", "risk_level": "MODERATE"},
    {"code": "OIL-RAJ", "name": "Rajasthan Basin Project", "region": "Western Asset", "site_type": "Desert Drilling & Pipeline", "risk_level": "HIGH"},
    {"code": "OIL-KGB", "name": "KG Basin Offshore Terminal", "region": "Eastern Coast", "site_type": "High-Pressure Gas Terminal", "risk_level": "CRITICAL"}
]

DEPARTMENTS = ["Maintenance", "Drilling", "Production", "Electrical & Instrumentation", "Pipelining", "HSE", "Logistics & Transport"]

CONTRACTORS = [
    "Apex Oilfield Engineering Pvt Ltd",
    "Brahmaputra Rigging & Heavy Lift",
    "Assam Petro Services",
    "Eastern Gas Pipeline Solutions",
    "GeoTech Drilling Contractors",
    "National Transport & Fleet Services",
    "Pioneer Industrial Scaffolders"
]

# Curated Realistic Oil India Limited Free-Form Safety Scenarios (SIF and Non-SIF)
SAFETY_INCIDENT_TEMPLATES = [
    # High SIF Precursors
    {
        "text": "During maintenance activity, a technician entered the compressor area while equipment was energized. Lockout/tagout had not been completed and another employee was standing near the rotating coupling.",
        "type": "Unsafe Act",
        "activity": "Maintenance",
        "equipment": "Compressor / Rotating Equipment",
        "location": "Compressor Area 3",
        "role": "Mechanical Technician",
        "sif": True
    },
    {
        "text": "Technician entered secondary separator vessel without atmospheric gas testing and without confined space permit. Standby person was absent from manway.",
        "type": "Unsafe Act",
        "activity": "Confined Space Entry",
        "equipment": "Pressure Vessel / Separator",
        "location": "Separator Train B",
        "role": "Process Operator",
        "sif": True
    },
    {
        "text": "Contractor scaffolding crew dismantled working platform at 8 meters elevation without wearing fall arrest harness and safety lifeline was unanchored.",
        "type": "Unsafe Condition",
        "activity": "Maintenance",
        "equipment": "Scaffolding / Working Platform",
        "location": "Derrick Mast",
        "role": "Contract Worker",
        "sif": True
    },
    {
        "text": "Crane wire rope showed severe fraying during lifting of 6-ton blowout preventer (BOP). Suspended load swung over roughneck crew standing in line of fire.",
        "type": "Near Miss",
        "activity": "Mechanical Lifting",
        "equipment": "Crane / Lifting Appliance",
        "location": "Rig Floor Rig-42",
        "role": "Crane Operator / Rigger",
        "sif": True
    },
    {
        "text": "Hot work welding initiated on crude manifold line without gas testing. Hydrocarbon traces detected immediately after sparks were produced; work stopped.",
        "type": "Near Miss",
        "activity": "Hot Work",
        "equipment": "Piping & Manifold",
        "location": "Well Pad 14",
        "role": "Welder / Fabricator",
        "sif": True
    },
    {
        "text": "Mud pump liner replacement ongoing with electric motor main breaker closed. Lockout tagout absent and apprentice helper was reaching into cylinder block.",
        "type": "Unsafe Act",
        "activity": "Maintenance",
        "equipment": "Drilling Rig / Drawworks",
        "location": "Pump House",
        "role": "Mechanical Technician",
        "sif": True
    },
    {
        "text": "High pressure mud circulation line failed at 3500 psi hammer union flange. Pressure whip check cable was not installed; line jumped 2 meters across walkway.",
        "type": "Incident",
        "activity": "Drilling",
        "equipment": "Piping & Manifold",
        "location": "Standpipe Manifold",
        "role": "Rig Roughneck",
        "sif": True
    },
    {
        "text": "H2S toxic gas detector was alarming at 15 ppm near cellar pit. Operator attempted entry without SCBA breathing apparatus to inspect leaking stuffing box.",
        "type": "Unsafe Act",
        "activity": "Production",
        "equipment": "Wellhead / Christmas Tree",
        "location": "Cellar Pit Well-209",
        "role": "Process Operator",
        "sif": True
    },
    {
        "text": "Heavy crude oil bowser tanker skidded on wet lease road and overturned into drainage berm. Driver was found unbuckled and speeding above 40 km/h limit.",
        "type": "Incident",
        "activity": "Transportation",
        "equipment": "Transportation",
        "location": "Access Road Sector 4",
        "role": "Contract Worker",
        "sif": True
    },
    {
        "text": "Emergency shutdown ESD bypass jumper left installed on high-pressure separator PSV relief valve without authorization permit or risk assessment.",
        "type": "Unsafe Condition",
        "activity": "Operations",
        "equipment": "Pressure Vessel / Separator",
        "location": "Control Room Panel",
        "role": "Electrician",
        "sif": True
    },
    # Realistic Hinglish / Field Language Examples
    {
        "text": "Compressor trip hone ke baad technician ne bina LOTO check kiye coupling guard khol diya jabki motor energized thi. Bada accident ho sakta tha.",
        "type": "Near Miss",
        "activity": "Maintenance",
        "equipment": "Compressor / Rotating Equipment",
        "location": "Compressor Area 2",
        "role": "Mechanical Technician",
        "sif": True
    },
    {
        "text": "Rig floor par contractor worker bina safety harness ke 5 meter height par pipe guide repair kar raha tha. Fall protection bilkul missing tha.",
        "type": "Unsafe Act",
        "activity": "Maintenance",
        "equipment": "Scaffolding / Working Platform",
        "location": "Rig Floor",
        "role": "Contract Worker",
        "sif": True
    },
    {
        "text": "Lifting operation chalte waqt roughneck suspended casing pipe ke neeche khada tha. Tag line use nahi ki gayi thi.",
        "type": "Unsafe Act",
        "activity": "Mechanical Lifting",
        "equipment": "Crane / Lifting Appliance",
        "location": "Pipe Rack",
        "role": "Rig Roughneck",
        "sif": True
    },
    {
        "text": "Gas plant ke flare header ke paas bina hot work permit aur gas test ke grinder chalaya gaya. Spark nikalne par supervisor ne turant kaam band karwaya.",
        "type": "Near Miss",
        "activity": "Hot Work",
        "equipment": "Piping & Manifold",
        "location": "Flare Pit Area",
        "role": "Welder / Fabricator",
        "sif": True
    },
    # Non-SIF Routine / Low Risk Examples
    {
        "text": "Administrative office desk drawer was left slightly open causing visitor to brush against handle. No injury sustained, drawer closed immediately.",
        "type": "Unsafe Condition",
        "activity": "General Operations",
        "equipment": "General Facility",
        "location": "Admin Building 1st Floor",
        "role": "Process Operator",
        "sif": False
    },
    {
        "text": "Technician experienced minor paper cut on right index finger while filing daily tally sheets in shift office. Applied antiseptic band-aid.",
        "type": "Incident",
        "activity": "General Operations",
        "equipment": "General Facility",
        "location": "Control Room",
        "role": "Mechanical Technician",
        "sif": False
    },
    {
        "text": "Small water puddle noticed near water cooler due to slight condensate drip. Caution wet floor signboard placed and housekeeping notified.",
        "type": "Unsafe Condition",
        "activity": "General Operations",
        "equipment": "General Facility",
        "location": "Canteen Hall",
        "role": "Process Operator",
        "sif": False
    },
    {
        "text": "Workshop floor had cardboard packaging scrap left near tool rack after unpacking new air filters. Cleared immediately into recycling bin.",
        "type": "Unsafe Condition",
        "activity": "Maintenance",
        "equipment": "General Facility",
        "location": "Mechanical Workshop",
        "role": "Mechanical Technician",
        "sif": False
    },
    {
        "text": "Safety helmet chin strap was worn out and loose. Worker reported to safety store and exchanged for new ISI certified helmet.",
        "type": "Unsafe Condition",
        "activity": "General Operations",
        "equipment": "General Facility",
        "location": "Store Room",
        "role": "Rig Roughneck",
        "sif": False
    },
    {
        "text": "Routine weekly walk-around inspection of dry chemical powder (DCP) fire extinguisher gauge confirmed needle in green normal pressure zone.",
        "type": "Unsafe Condition",
        "activity": "General Operations",
        "equipment": "General Facility",
        "location": "Switchgear Room",
        "role": "Electrician",
        "sif": False
    },
    {
        "text": "Slight grease mark on walkway handrail wiped clean with cotton waste rag before crew shift change.",
        "type": "Unsafe Condition",
        "activity": "Maintenance",
        "equipment": "General Facility",
        "location": "Walkway Gantry",
        "role": "Contract Worker",
        "sif": False
    },
    {
        "text": "Visitor gate pass badge barcode faded. Security desk re-issued updated visitor laminate card.",
        "type": "Unsafe Act",
        "activity": "General Operations",
        "equipment": "General Facility",
        "location": "Main Security Gate",
        "role": "Process Operator",
        "sif": False
    }
]

def seed_users_and_rules(db):
    # 1. Life Saving Rules
    existing_rules = db.query(LifeSavingRule).count()
    if existing_rules == 0:
        for r in LIFE_SAVING_RULES_DEFINITIONS:
            rule = LifeSavingRule(
                code=r["code"],
                name=r["name"],
                category=r["category"],
                icon=r["icon"],
                description=r["description"],
                criticality_weight=1.0,
                total_violations=0,
                sif_violations=0
            )
            db.add(rule)
        db.commit()

    # 2. Sites
    existing_sites = db.query(Site).count()
    if existing_sites == 0:
        for s in SITES_DATA:
            site = Site(
                code=s["code"],
                name=s["name"],
                region=s["region"],
                site_type=s["site_type"],
                risk_level=s["risk_level"]
            )
            db.add(site)
        db.commit()

    # 3. Users
    existing_users = db.query(User).count()
    if existing_users == 0:
        from app.api.v1.endpoints.auth import DEMO_ACCOUNTS
        for role_key, acc in DEMO_ACCOUNTS.items():
            u = User(
                email=acc["email"],
                hashed_password=get_password_hash("password123"),
                full_name=acc["full_name"],
                role=acc["role"],
                site=acc["site"],
                department=acc["department"]
            )
            db.add(u)
        db.commit()

def generate_reports(count: int = 100):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        seed_users_and_rules(db)
        print(f"Generating {count} realistic safety reports for OIL SIF SENTINEL...")
        
        sites = db.query(Site).all()
        now = datetime.now(timezone.utc)
        max_id = db.query(func.max(Report.id)).scalar() or 0

        created_count = 0
        sif_count = 0

        for i in range(count):
            tpl = random.choice(SAFETY_INCIDENT_TEMPLATES)
            site = random.choice(sites)
            dept = random.choice(DEPARTMENTS)
            date_offset = random.randint(1, 180)
            date_time = now - timedelta(days=date_offset, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            contractor_inv = random.choice([True, False, False])
            contractor_name = random.choice(CONTRACTORS) if contractor_inv else None
            shift = random.choice(["Morning", "Evening", "Night"])

            text = tpl["text"]
            # Add slight variation in location or wording for realism
            if random.random() < 0.3 and not tpl["sif"]:
                text += f" Observed at {site.name} during routine {dept.lower()} walkthrough."

            # AI Pipeline
            meta = {
                "activity": tpl["activity"],
                "location": tpl["location"],
                "equipment": tpl["equipment"],
                "worker_role": tpl["role"],
                "shift": shift,
                "department_name": dept,
                "contractor_involved": contractor_inv
            }
            entities = entity_extractor.extract(text, meta)
            rule_results = rules_classifier.classify(text)
            sif_res = sif_classifier.predict(text)
            risk_res = risk_scoring_engine.calculate_risk(
                sif_probability=sif_res["sif_probability"],
                consequences=entities.get("potential_consequences", []),
                barrier_failures=entities.get("barrier_failures", []),
                rules=rule_results,
                activity=entities.get("activity", tpl["activity"])
            )
            explain_res = explainability_engine.explain(
                text=text,
                sif_prob=sif_res["sif_probability"],
                is_sif=sif_res["sif_prediction"],
                top_tokens=sif_res.get("top_features", []),
                rules=rule_results,
                entities=entities
            )

            rep_uid = f"OIL-2026-{1000 + max_id + i + 1}"
            report = Report(
                report_uid=rep_uid,
                report_type=tpl["type"],
                site_name=site.name,
                department_name=dept,
                date_time=date_time,
                location=entities.get("location") or tpl["location"],
                activity=entities.get("activity") or tpl["activity"],
                equipment=entities.get("equipment") or tpl["equipment"],
                worker_role=entities.get("worker_role") or tpl["role"],
                shift=shift,
                contractor_involved=contractor_inv,
                contractor_name=contractor_name,
                raw_description=text,
                status="Validated" if i % 4 == 0 else "Analyzed",
                severity=risk_res["risk_level"],
                risk_score=risk_res["risk_score"],
                sif_potential=sif_res["sif_prediction"],
                sif_probability=sif_res["sif_probability"],
                created_at=date_time
            )
            db.add(report)
            db.flush()

            analysis = ReportAnalysis(
                report_id=report.id,
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
                analyzed_at=date_time
            )
            db.add(analysis)

            # Update site metrics
            site.total_reports += 1
            if sif_res["sif_prediction"]:
                site.sif_reports += 1
                sif_count += 1
            site.sif_density = round((site.sif_reports / site.total_reports * 100), 2) if site.total_reports > 0 else 0.0

            # Update rule statistics
            for r_res in rule_results:
                r_code = r_res["rule_code"]
                db_rule = db.query(LifeSavingRule).filter(LifeSavingRule.code == r_code).first()
                if db_rule:
                    db_rule.total_violations += 1
                    if sif_res["sif_prediction"]:
                        db_rule.sif_violations += 1

            # Create sample Alerts for top critical items
            if sif_res["sif_prediction"] and random.random() < 0.35:
                alt_uid = f"ALT-2026-{random.randint(100, 9999):04d}"
                alert = Alert(
                    alert_uid=alt_uid,
                    title=f"CRITICAL SIF PRECURSOR: {entities.get('activity')} at {site.name}",
                    description=f"SIF Probability {int(sif_res['sif_probability']*100)}% ({risk_res['risk_level']}). Primary barrier failure: {entities.get('barrier_failures', [''])[0]}",
                    priority="CRITICAL" if risk_res["risk_level"] == "CRITICAL" else "HIGH",
                    status=random.choice(["OPEN", "OPEN", "ACKNOWLEDGED", "RESOLVED"]),
                    report_id=report.id,
                    site_name=site.name,
                    activity=entities.get("activity") or tpl["activity"],
                    hazard=entities.get("hazards", ["Hazard"])[0],
                    sif_probability=sif_res["sif_probability"],
                    assigned_to="Lead HSE Officer",
                    created_at=date_time
                )
                db.add(alert)

            created_count += 1
            if created_count % 100 == 0:
                db.commit()
                print(f"  Inserted {created_count}/{count} records...")

        db.commit()
        print("Mining precursor patterns from generated dataset...")
        precursor_miner.mine_patterns_from_db(db)
        print(f"Successfully generated {created_count} safety reports! Total SIF potential: {sif_count} ({round(sif_count/created_count*100, 1)}%)")

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate demo safety reports for OIL SIF SENTINEL")
    parser.add_argument("--count", type=int, default=150, help="Number of reports to generate (e.g. 150, 1000, 10000)")
    args = parser.parse_args()
    generate_reports(args.count)
