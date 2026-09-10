from collections import defaultdict
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database.models import Report, PrecursorPattern, utcnow

class PrecursorMiner:
    def mine_patterns_from_db(self, db: Session) -> List[Dict[str, Any]]:
        reports = db.query(Report).all()
        if not reports:
            return []

        pattern_groups = defaultdict(lambda: {
            "occurrences": 0,
            "sif_count": 0,
            "sites": set(),
            "activity": "",
            "hazard": "",
            "barrier_failure": "",
            "equipment": "",
            "location": ""
        })

        for rep in reports:
            analysis = rep.analysis
            if not analysis:
                continue
            
            entities = analysis.entity_extraction or {}
            activity = entities.get("activity") or rep.activity or "Operations"
            hazards = entities.get("hazards") or ["General Hazard"]
            barrier_failures = entities.get("barrier_failures") or ["Barrier Breakdown"]
            equipment = entities.get("equipment") or rep.equipment or "Process Unit"
            location = entities.get("location") or rep.location or "Plant Area"

            # Primary combination
            primary_hazard = hazards[0] if hazards else "Hazard"
            primary_barrier = barrier_failures[0] if barrier_failures else "Barrier Failure"

            key = f"{activity} | {equipment} | {primary_hazard} | {primary_barrier}"
            group = pattern_groups[key]
            group["occurrences"] += 1
            if rep.sif_potential or (analysis and analysis.sif_prediction):
                group["sif_count"] += 1
            group["sites"].add(rep.site_name)
            group["activity"] = activity
            group["equipment"] = equipment
            group["hazard"] = primary_hazard
            group["barrier_failure"] = primary_barrier
            group["location"] = location

        results = []
        for key, data in pattern_groups.items():
            if data["occurrences"] >= 2:  # Recurring pattern threshold
                assoc_rate = round((data["sif_count"] / data["occurrences"]) * 100, 1)
                
                if assoc_rate >= 75.0:
                    risk = "CRITICAL"
                elif assoc_rate >= 50.0:
                    risk = "HIGH"
                elif assoc_rate >= 25.0:
                    risk = "MODERATE"
                else:
                    risk = "LOW"

                trend = "Increasing" if data["occurrences"] >= 5 and assoc_rate >= 60 else "Stable"
                
                pattern_dict = {
                    "pattern_key": key,
                    "activity": data["activity"],
                    "equipment": data["equipment"],
                    "hazard": data["hazard"],
                    "barrier_failure": data["barrier_failure"],
                    "location": data["location"],
                    "occurrences": data["occurrences"],
                    "sif_count": data["sif_count"],
                    "sif_association_rate": assoc_rate,
                    "risk_level": risk,
                    "trend": trend,
                    "affected_sites": list(data["sites"])
                }
                results.append(pattern_dict)
                
                # Sync into PrecursorPattern database table
                existing = db.query(PrecursorPattern).filter(PrecursorPattern.pattern_key == key).first()
                if existing:
                    existing.occurrence_count = data["occurrences"]
                    existing.sif_count = data["sif_count"]
                    existing.sif_association_rate = assoc_rate
                    existing.risk_level = risk
                    existing.trend = trend
                    existing.affected_sites = list(data["sites"])
                    existing.last_detected_at = utcnow()
                else:
                    db_pattern = PrecursorPattern(
                        pattern_key=key,
                        activity=data["activity"],
                        equipment=data["equipment"],
                        hazard=data["hazard"],
                        barrier_failure=data["barrier_failure"],
                        location=data["location"],
                        occurrence_count=data["occurrences"],
                        sif_count=data["sif_count"],
                        sif_association_rate=assoc_rate,
                        risk_level=risk,
                        trend=trend,
                        affected_sites=list(data["sites"]),
                        last_detected_at=utcnow()
                    )
                    db.add(db_pattern)

        db.commit()
        results.sort(key=lambda x: (x["sif_association_rate"], x["occurrences"]), reverse=True)
        return results

precursor_miner = PrecursorMiner()
