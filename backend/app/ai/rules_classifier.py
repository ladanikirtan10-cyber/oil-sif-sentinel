import re
from typing import List, Dict, Any

LIFE_SAVING_RULES_DEFINITIONS = [
    {
        "code": "LSR-01",
        "name": "Energy Isolation",
        "category": "Isolation & Barriers",
        "icon": "ZapOff",
        "description": "Verify isolation and zero energy state before work begins. Apply Lockout/Tagout (LOTO).",
        "keywords": [
            "lockout", "tagout", "loto", "energized", "de-energized", "live wire", "isolation",
            "circuit breaker", "breaker", "residual energy", "stored energy", "electrical isolation",
            "valve isolation", "bleed off", "zero energy", "coupling", "motor energized"
        ]
    },
    {
        "code": "LSR-02",
        "name": "Confined Space Entry",
        "category": "Atmospheric Safety",
        "icon": "Box",
        "description": "Obtain authorization, verify atmospheric testing, and ensure standby person is present before entry.",
        "keywords": [
            "confined space", "vessel entry", "tank", "storage tank", "manhole", "cellar pit",
            "oxygen deficiency", "toxic atmosphere", "standby person", "entry permit",
            "nitrogen purge", "gas test", "multi-gas detector", "asphyxiation", "separator vessel"
        ]
    },
    {
        "code": "LSR-03",
        "name": "Working at Height",
        "category": "Fall Protection",
        "icon": "ShieldAlert",
        "description": "Protect yourself against a fall when working at height (above 1.8m). Wear full body harness and anchor properly.",
        "keywords": [
            "working at height", "height", "scaffold", "scaffolding", "safety harness", "lanyard",
            "fall arrest", "fall protection", "ladder", "elevated platform", "derrick",
            "monkey board", "fall", "toe board", "handrail missing", "life line", "anchor point"
        ]
    },
    {
        "code": "LSR-04",
        "name": "Line of Fire",
        "category": "Physical Hazards",
        "icon": "Target",
        "description": "Keep yourself and others out of the path of moving objects, pressurized releases, and stored mechanical energy.",
        "keywords": [
            "line of fire", "rotating", "coupling", "shaft", "pinch point", "pinch", "high pressure line",
            "pressurized", "whip", "hose whipping", "projectile", "struck by", "swing radius",
            "drill string", "kelly bushing", "cathead", "rotary table", "flying debris", "crush hazard"
        ]
    },
    {
        "code": "LSR-05",
        "name": "Safe Mechanical Lifting",
        "category": "Lifting Operations",
        "icon": "Anchor",
        "description": "Plan lifting operations, inspect rigging gear, and never walk under a suspended load.",
        "keywords": [
            "lifting", "crane", "mobile crane", "crawler crane", "hoist", "rigger", "rigging",
            "sling", "webbing sling", "wire rope", "shackle", "suspended load", "tag line",
            "lift plan", "overload", "boom", "winch", "dropped drill pipe", "hoisting"
        ]
    },
    {
        "code": "LSR-06",
        "name": "Hot Work & Work Authorization",
        "category": "Fire & Explosion",
        "icon": "Flame",
        "description": "Perform hot work only with a valid Permit-To-Work, gas test verification, and active fire watch.",
        "keywords": [
            "hot work", "welding", "grinding", "cutting torch", "gas cutting", "permit to work",
            "ptw", "work authorization", "fire watch", "spark", "flammable", "hydrocarbon area",
            "explosive atmosphere", "gas test prior to hot work", "welding spark"
        ]
    },
    {
        "code": "LSR-07",
        "name": "Driving & Journey Safety",
        "category": "Transport Safety",
        "icon": "Truck",
        "description": "Wear seatbelts, adhere to speed limits, and eliminate mobile phone distraction while driving oilfield vehicles.",
        "keywords": [
            "driving", "vehicle", "seat belt", "speeding", "overturn", "truck", "tanker", "bowser",
            "crude tanker", "fatigue", "mobile while driving", "driver", "journey management",
            "road safety", "skid", "rollover"
        ]
    },
    {
        "code": "LSR-08",
        "name": "Toxic Gas & Pressure Control",
        "category": "Well & Process Safety",
        "icon": "Wind",
        "description": "Monitor toxic gas (H2S), verify barrier integrity, and maintain primary and secondary well pressure control.",
        "keywords": [
            "h2s", "hydrogen sulfide", "toxic gas", "sour crude", "gas leak", "wellhead", "christmas tree",
            "blowout preventer", "bop", "well kick", "overpressure", "pressure test", "casing pressure",
            "choke manifold", "gas detector alarm", "scba", "breathing apparatus"
        ]
    },
    {
        "code": "LSR-09",
        "name": "System Bypass & Safety Critical Override",
        "category": "Engineered Systems",
        "icon": "ToggleRight",
        "description": "Obtain authorization before overriding or disabling safety-critical equipment, interlocks, or relief devices.",
        "keywords": [
            "bypass", "override", "interlock", "safety critical", "esd", "emergency shutdown",
            "relief valve", "psv", "safety trip", "disable alarm", "jumper", "defeated",
            "fire and gas detector isolated", "inhibited"
        ]
    }
]

class RulesClassifier:
    def __init__(self):
        self.rules = LIFE_SAVING_RULES_DEFINITIONS

    def classify(self, text: str) -> List[Dict[str, Any]]:
        if not text:
            return []
        
        text_lower = text.lower()
        results = []
        
        for rule in self.rules:
            matches = []
            score = 0.0
            
            for kw in rule["keywords"]:
                pattern = r"\b" + re.escape(kw) + r"\b"
                if re.search(pattern, text_lower):
                    matches.append(kw)
                    score += 0.35
            
            if matches:
                # Calibrate confidence score between 0.50 and 0.98
                confidence = min(0.98, 0.55 + (score * 0.3))
                results.append({
                    "rule_code": rule["code"],
                    "rule_name": rule["name"],
                    "category": rule["category"],
                    "icon": rule["icon"],
                    "confidence": round(confidence, 2),
                    "matched_keywords": matches,
                    "description": rule["description"]
                })
        
        # Sort by confidence descending
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results

rules_classifier = RulesClassifier()
