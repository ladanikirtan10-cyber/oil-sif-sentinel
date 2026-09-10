from typing import Dict, Any
from app.core.config import settings

class RiskScoringEngine:
    def calculate_risk(
        self,
        sif_probability: float,
        consequences: list,
        barrier_failures: list,
        rules: list,
        activity: str,
        is_incident: bool = False
    ) -> Dict[str, Any]:
        
        # 1. Severity estimation (1-5)
        severity = 2
        conseq_text = " ".join(consequences).lower()
        if "fatal" in conseq_text or "asphyxiation" in conseq_text or "blast" in conseq_text:
            severity = 5
        elif "crushing" in conseq_text or "amputation" in conseq_text or "electrocution" in conseq_text:
            severity = 4
        elif "severe fall" in conseq_text or "fracture" in conseq_text:
            severity = 3
        elif "first aid" in conseq_text or "minor" in conseq_text:
            severity = 1
            
        # 2. Likelihood estimation (1-5)
        # Based on SIF probability and barrier breakdown
        if sif_probability >= 0.85 or (len(barrier_failures) >= 2 and sif_probability >= 0.70):
            likelihood = 5
        elif sif_probability >= 0.65:
            likelihood = 4
        elif sif_probability >= 0.45:
            likelihood = 3
        elif sif_probability >= 0.25:
            likelihood = 2
        else:
            likelihood = 1

        # 3. Component Weights (Configurable)
        w_sif = settings.WEIGHT_SIF_PROB
        w_sev = settings.WEIGHT_SEVERITY
        w_exp = settings.WEIGHT_EXPOSURE
        w_bar = settings.WEIGHT_BARRIER
        w_rec = settings.WEIGHT_RECURRENCE

        # Normalize components to 0-100 scale
        sif_component = sif_probability * 100
        severity_component = (severity / 5.0) * 100
        
        # Exposure component based on activity criticality
        high_risk_activities = ["maintenance", "drilling", "lifting", "confined space entry", "hot work"]
        if activity.lower() in high_risk_activities:
            exposure_component = 85.0
        else:
            exposure_component = 45.0
            
        # Barrier failure component
        barrier_component = min(100.0, len(barrier_failures) * 45.0)
        
        # Recurrence component
        recurrence_component = 70.0 if rules else 30.0

        # Calculate final composite score
        composite_score = (
            (sif_component * w_sif) +
            (severity_component * w_sev) +
            (exposure_component * w_exp) +
            (barrier_component * w_bar) +
            (recurrence_component * w_rec)
        )
        
        composite_score = round(max(5.0, min(99.0, composite_score)), 1)
        
        # Categorize
        if composite_score >= 76.0 or (sif_probability >= 0.85 and severity >= 4):
            risk_level = "CRITICAL"
        elif composite_score >= 56.0:
            risk_level = "HIGH"
        elif composite_score >= 31.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        return {
            "risk_score": composite_score,
            "risk_level": risk_level,
            "likelihood": likelihood,
            "severity": severity,
            "matrix_cell": f"L{likelihood}-S{severity}",
            "components": {
                "sif_probability_weight": w_sif,
                "severity_score": severity,
                "likelihood_score": likelihood,
                "exposure_factor": round(exposure_component, 1),
                "barrier_failure_factor": round(barrier_component, 1)
            }
        }

risk_scoring_engine = RiskScoringEngine()
