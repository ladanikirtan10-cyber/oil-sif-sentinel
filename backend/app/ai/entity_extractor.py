import re
from typing import Dict, Any, List

ACTIVITIES_MAP = {
    "maintenance": ["maintenance", "preventive maintenance", "overhaul", "repair", "servicing", "lubrication", "bearing replacement", "inspection"],
    "drilling": ["drilling", "tripping pipe", "casing", "cementing", "making connection", "mud mixing", "drilling ahead", "spudding"],
    "mechanical lifting": ["lifting", "crane operation", "rigging", "hoisting", "pipe handling", "slinging", "unloading tubulars"],
    "hot work": ["hot work", "welding", "grinding", "gas cutting", "torch cutting", "brazing", "heating"],
    "electrical work": ["electrical work", "panel wiring", "cable pulling", "transformer servicing", "breaker rack-in", "motor testing"],
    "confined space entry": ["confined space", "vessel cleaning", "tank entry", "column turnaround", "pit inspection"],
    "pipelining": ["pigging", "hydrotest", "flange bolting", "pipeline trenching", "pipe laying", "welding joint"],
    "workover": ["workover", "well servicing", "swabbing", "wireline", "coiled tubing", "snubbing"],
    "transportation": ["transportation", "driving", "transit", "tanker loading", "material shifting", "crew transit"]
}

EQUIPMENT_MAP = {
    "Compressor / Rotating Equipment": ["compressor", "centrifugal compressor", "reciprocating compressor", "rotating coupling", "shaft", "coupling", "motor"],
    "Drilling Rig / Drawworks": ["rig", "drawworks", "kelly bushing", "rotary table", "cathead", "top drive", "mud pump", "derrick"],
    "Crane / Lifting Appliance": ["crane", "mobile crane", "crawler crane", "hoist", "wire rope", "sling", "spreader bar", "winch"],
    "Wellhead / Christmas Tree": ["wellhead", "christmas tree", "x-mas tree", "bop", "blowout preventer", "casing head", "choke manifold"],
    "Pressure Vessel / Separator": ["separator", "pressure vessel", "knockout drum", "test separator", "scrubber", "filter separator"],
    "Electrical Switchgear / Transformer": ["switchgear", "transformer", "mcc panel", "breaker", "busbar", "distribution board", "junction box"],
    "Piping & Manifold": ["flange", "manifold", "pipeline", "valve", "relief valve", "psv", "pig launcher", "header line"],
    "Scaffolding / Working Platform": ["scaffold", "scaffolding", "work platform", "staging", "ladder", "handrail"]
}

HAZARDS_MAP = {
    "Unexpected startup": ["energized", "unexpected startup", "automatic restart", "live system", "un-isolated"],
    "Rotating machinery": ["rotating", "coupling", "rotating shaft", "nip point", "in-running nips", "spinning rotor"],
    "Stored energy / Pressure": ["stored energy", "pressurized line", "residual pressure", "hydraulic pressure", "pneumatic force"],
    "Toxic gas release (H2S)": ["h2s", "toxic gas", "sour gas", "gas leak", "hydrocarbon vapor", "flammable gas"],
    "High voltage electrical": ["high voltage", "live wire", "arc flash", "electrocution hazard", "bare conductor"],
    "Fall from height": ["fall from height", "working at height", "unprotected edge", "missing handrail", "fall"],
    "Suspended load": ["suspended load", "overhead load", "unattended suspended pipe", "sling failure"],
    "Fire and explosion": ["fire", "explosion", "spark", "hydrocarbon leak", "flash fire", "combustible mixture"],
    "Line of fire / Pinch point": ["pinch point", "line of fire", "caught between", "struck by", "swinging object"]
}

BARRIER_FAILURES_MAP = {
    "Lockout/Tagout not completed": ["lockout/tagout had not been completed", "lockout/tagout not completed", "loto not applied", "no lockout", "no tagout", "not isolated", "isolation not verified"],
    "Inadequate exclusion zone": ["standing near", "entered restricted area", "no barricade", "exclusion zone breached", "standing under", "too close to"],
    "Missing gas testing": ["gas test not done", "without gas testing", "atmospheric test missing", "gas tester not used"],
    "Fall arrest not anchored / missing harness": ["without harness", "no safety harness", "harness not anchored", "missing lifeline", "no fall arrest"],
    "Missing Permit-To-Work (PTW)": ["without permit", "no ptw", "valid permit not obtained", "unauthorized work", "permit expired"],
    "Safety interlock / relief bypass": ["bypassed", "override", "interlock defeated", "psv gagged", "safety switch taped"],
    "Inadequate PPE": ["without helmet", "safety glasses missing", "no gloves", "improper ppe", "without arc flash suit"]
}

CONSEQUENCES_MAP = {
    "Crushing / Entanglement": ["entanglement", "crushing", "pinch", "amputation", "limb trapped"],
    "Fatal injury": ["fatal injury", "fatality", "death", "severe trauma", "critical injury"],
    "Electrocution": ["electrocution", "electric shock", "electrical burn", "cardiac arrest"],
    "Toxic asphyxiation": ["asphyxiation", "h2s poisoning", "loss of consciousness", "suffocation"],
    "Severe fall injury": ["multiple fractures", "spinal injury", "internal bleeding", "fall injury"],
    "Burn / Blast trauma": ["burns", "blast trauma", "flash burns", "shrapnel injury"]
}

WORKER_ROLES_MAP = {
    "Mechanical Technician": ["technician", "mechanic", "millwright", "maintenance technician", "fitter"],
    "Contract Worker": ["contract worker", "contractor employee", "third party worker", "contract laborer"],
    "Rig Roughneck": ["roughneck", "derrickman", "driller", "assistant driller", "floorman"],
    "Welder / Fabricator": ["welder", "gas cutter", "fabricator", "grinder"],
    "Crane Operator / Rigger": ["crane operator", "rigger", "signalman", "slinger"],
    "Electrician": ["electrician", "instrument technician", "electrical supervisor"],
    "Process Operator": ["operator", "plant operator", "field operator", "console operator"]
}

class EntityExtractor:
    def extract(self, text: str, metadata: dict = None) -> Dict[str, Any]:
        if not text:
            return {}
        
        text_lower = text.lower()
        metadata = metadata or {}
        spans = []

        def find_spans(term, label):
            for m in re.finditer(r"\b" + re.escape(term) + r"\b", text_lower):
                spans.append({
                    "start": m.start(),
                    "end": m.end(),
                    "text": text[m.start():m.end()],
                    "label": label
                })

        # 1. Activity
        activity = metadata.get("activity") or "General Operations"
        for act_name, terms in ACTIVITIES_MAP.items():
            for t in terms:
                if t in text_lower:
                    activity = act_name.title()
                    find_spans(t, "ACTIVITY")
                    break
            if activity != "General Operations" and not metadata.get("activity"):
                break

        # 2. Location
        location = metadata.get("location") or "Compressor Area"
        loc_patterns = [
            r"\bcompressor\s+area\b",
            r"\brig\s+floor\b",
            r"\bwell\s+pad\b",
            r"\bflare\s+pit\b",
            r"\bcellar\s+pit\b",
            r"\btank\s+farm\b",
            r"\bpipe\s+rack\b",
            r"\bcontrol\s+room\b"
        ]
        for pat in loc_patterns:
            m = re.search(pat, text_lower)
            if m:
                location = m.group(0).title()
                spans.append({
                    "start": m.start(),
                    "end": m.end(),
                    "text": text[m.start():m.end()],
                    "label": "LOCATION"
                })
                break

        # 3. Equipment
        equipment = metadata.get("equipment") or "Compressor / Rotating Equipment"
        for eq_name, terms in EQUIPMENT_MAP.items():
            found = False
            for t in terms:
                if t in text_lower:
                    equipment = eq_name
                    find_spans(t, "EQUIPMENT")
                    found = True
            if found and not metadata.get("equipment"):
                break

        # 4. Hazards
        hazards = []
        for haz_name, terms in HAZARDS_MAP.items():
            for t in terms:
                if t in text_lower:
                    hazards.append(haz_name)
                    find_spans(t, "HAZARD")
                    break
        if not hazards:
            hazards = ["Unexpected startup", "Rotating machinery"]

        # 5. Barrier Failures
        barrier_failures = []
        for bar_name, terms in BARRIER_FAILURES_MAP.items():
            for t in terms:
                if t in text_lower:
                    barrier_failures.append(bar_name)
                    find_spans(t, "BARRIER_FAILURE")
                    break
        if not barrier_failures:
            barrier_failures = ["Lockout/Tagout not completed"]

        # 6. Consequences
        consequences = []
        for con_name, terms in CONSEQUENCES_MAP.items():
            for t in terms:
                if t in text_lower:
                    consequences.append(con_name)
                    find_spans(t, "CONSEQUENCE")
                    break
        if not consequences:
            if "energized" in text_lower or "rotating" in text_lower:
                consequences = ["Crushing / Entanglement", "Fatal injury"]
            elif "fall" in text_lower:
                consequences = ["Severe fall injury"]
            elif "h2s" in text_lower or "gas" in text_lower:
                consequences = ["Toxic asphyxiation"]
            else:
                consequences = ["Personal Injury"]

        # 7. Worker Role
        worker_role = metadata.get("worker_role") or "Mechanical Technician"
        for role_name, terms in WORKER_ROLES_MAP.items():
            for t in terms:
                if t in text_lower:
                    worker_role = role_name
                    find_spans(t, "WORKER_ROLE")
                    break
            if worker_role != "Mechanical Technician" and not metadata.get("worker_role"):
                break

        # 8. Contractor Involvement
        contractor_involved = metadata.get("contractor_involved", False)
        if any(c in text_lower for c in ["contractor", "contract worker", "third party", "vendor"]):
            contractor_involved = True

        # Deduplicate spans
        unique_spans = []
        seen = set()
        for s in spans:
            key = (s["start"], s["end"])
            if key not in seen:
                seen.add(key)
                unique_spans.append(s)
        unique_spans.sort(key=lambda x: x["start"])

        return {
            "activity": activity,
            "location": location,
            "equipment": equipment,
            "hazards": list(dict.fromkeys(hazards)),
            "barrier_failures": list(dict.fromkeys(barrier_failures)),
            "potential_consequences": list(dict.fromkeys(consequences)),
            "worker_role": worker_role,
            "contractor_involved": contractor_involved,
            "shift": metadata.get("shift", "Morning"),
            "department": metadata.get("department_name", "Maintenance"),
            "highlight_spans": unique_spans
        }

entity_extractor = EntityExtractor()
