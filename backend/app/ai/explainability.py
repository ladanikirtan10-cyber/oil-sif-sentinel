from typing import Dict, Any, List

class ExplainabilityEngine:
    def explain(
        self,
        text: str,
        sif_prob: float,
        is_sif: bool,
        top_tokens: List[Dict[str, Any]],
        rules: List[Dict[str, Any]],
        entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        
        risk_factors = []
        
        # 1. Evaluate barrier failures
        barrier_failures = entities.get("barrier_failures", [])
        for bf in barrier_failures:
            risk_factors.append(f"Primary safety barrier breached: {bf}")
            
        # 2. Evaluate high-energy hazards
        hazards = entities.get("hazards", [])
        for hz in hazards:
            if hz in ["Unexpected startup", "Rotating machinery", "Stored energy / Pressure", "Toxic gas release (H2S)", "High voltage electrical"]:
                risk_factors.append(f"High-energy hazard present: {hz}")
            else:
                risk_factors.append(f"Identified hazard: {hz}")
                
        # 3. Evaluate Life-Saving Rules
        for r in rules:
            if r.get("confidence", 0) >= 0.70:
                risk_factors.append(f"Life-Saving Rule violation signal: {r['rule_name']} (Confidence: {int(r['confidence']*100)}%)")
                
        # 4. Consequence severity
        consequences = entities.get("potential_consequences", [])
        if any("Fatal" in c or "Crushing" in c or "Asphyxiation" in c for c in consequences):
            risk_factors.append(f"High-potential severe consequence: {', '.join(consequences)}")
            
        # 5. Worker exposure
        activity = entities.get("activity", "Operations")
        worker = entities.get("worker_role", "Worker")
        risk_factors.append(f"Worker role ({worker}) directly engaged in {activity.lower()} within active zone")

        # Top driving tokens
        positive_tokens = [t for t in top_tokens if t.get("weight", 0) > 0][:6]
        
        # Human-readable rationale summary
        if is_sif:
            summary = (
                f"Flagged as SIF POTENTIAL ({int(sif_prob*100)}% probability) due to concurrence of "
                f"uncontrolled hazardous energy, barrier breakdown ({', '.join(barrier_failures[:2]) or 'lack of verified controls'}), "
                f"and worker positioning in direct line of fire during {activity}."
            )
        else:
            summary = (
                f"Classified as Non-SIF Potential ({int((1 - sif_prob)*100)}% non-SIF confidence). "
                f"No critical life-threatening energy release or catastrophic barrier failure mechanism identified."
            )

        return {
            "summary": summary,
            "risk_factors": risk_factors,
            "top_tokens": positive_tokens,
            "sif_probability": sif_prob,
            "is_sif": is_sif,
            "primary_barrier_impact": barrier_failures[0] if barrier_failures else "None Identified",
            "consequence_potential": consequences
        }

explainability_engine = ExplainabilityEngine()
