import re
import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from app.core.config import settings

# Safety keywords with high SIF indication
HIGH_SIF_TERMS = [
    "lockout", "tagout", "loto", "energized", "rotating", "coupling", "confined space",
    "gas test", "h2s", "toxic", "fall from height", "harness", "scaffold", "crane",
    "suspended load", "rigging", "wire rope", "blowout", "wellhead", "kick", "pressure",
    "rupture", "explosion", "fire", "welding", "hydrocarbon", "entanglement", "crushing",
    "amputation", "electrocution", "high voltage", "bypass", "unauthorized entry",
    "line of fire", "pinch point", "drowning", "trench collapse", "overturn"
]

NON_SIF_TERMS = [
    "minor slip", "small scratch", "first aid", "bandaid", "office", "paper cut",
    "housekeeping", "trip on flat surface", "spill clean up", "trash bin",
    "dust in eye", "water bottle", "routine inspection no defect", "minor scrape"
]

class SIFClassifier:
    def __init__(self, model_dir="backend/app/ai/models"):
        self.model_dir = model_dir
        self.vectorizer_path = os.path.join(model_dir, "tfidf_vectorizer.joblib")
        self.model_path = os.path.join(model_dir, "sif_classifier.joblib")
        self.vectorizer = None
        self.model = None
        self.version = settings.MODEL_VERSION
        self._initialize_model()

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r"[^a-zA-Z0-9\s/_-]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _initialize_model(self):
        os.makedirs(self.model_dir, exist_ok=True)
        if os.path.exists(self.vectorizer_path) and os.path.exists(self.model_path):
            try:
                self.vectorizer = joblib.load(self.vectorizer_path)
                self.model = joblib.load(self.model_path)
                return
            except Exception:
                pass
        
        # Train baseline calibrated model with rich synthetic safety corpus
        self._train_baseline_model()

    def _train_baseline_model(self):
        corpus = [
            ("During maintenance technician entered compressor area energized lockout tagout not completed rotating coupling", 1),
            ("Worker inside separator vessel without gas testing and permit oxygen deficiency risk", 1),
            ("Scaffold dismantled without safety harness worker fell 6 meters to concrete pad", 1),
            ("Crane wire snapped while lifting 8 ton drill collar dropped near roughneck crew", 1),
            ("Electrician touched live busbar 11kv panel without arc flash suit or isolation", 1),
            ("H2S toxic gas detector alarm ignored worker entered cellar pit collapsed", 1),
            ("Hot work welding done directly on live crude manifold without nitrogen purging sparks", 1),
            ("High pressure test line ruptured 3000 psi flange failed projectile struck handrail", 1),
            ("Drilling mud pump liner change while motor energized helper hand pinched in piston", 1),
            ("Heavy oilfield trailer overturned during night transit driver unbuckled speeding curve", 1),
            ("Safety relief valve PSV bypassed with blind flange on separator overpressure risk", 1),
            ("Contractor worker standing directly under suspended drill pipe during hoist", 1),
            ("Excavation wall 4m deep collapsed on pipe layer trench box not installed", 1),
            ("Technician clothing caught in un-guarded rotating shaft of crude transfer pump", 1),
            ("Nitrogen manifold backflow into air receiver vessel line of fire asphyxiation", 1),
            
            # Non-SIF examples
            ("Technician sustained minor paper cut while filing permit documentation in cabin", 0),
            ("Housekeeping issue empty cardboard boxes stacked near walkway disposed properly", 0),
            ("Small grease drip on workshop floor cleaned with rag before any slip occurred", 0),
            ("Contractor forgot safety glasses in locker went back and retrieved them immediately", 0),
            ("Routine weekly inspection of fire extinguisher pressure gauge found green normal", 0),
            ("Slight dust accumulated on solar battery panel wiped clean with brush", 0),
            ("Plastic water dispenser tap leaking slow drip drip tray emptied by janitor", 0),
            ("Worker felt mild ankle twist stepping off low 10cm curb applied ice pack", 0),
            ("Safety helmet had scratched logo replaced with new helmet from store", 0),
            ("Printer paper jam in administrative office cleared by dispatch clerk", 0),
            ("Safety shoes worn out tread replaced with new pair from store register", 0),
            ("Visitor escort badge misprinted corrected at security gate no delay", 0),
            ("Minor paint chip on handrail repainted during routine yard touch up", 0),
            ("Empty plastic sample bottle found in drainage channel picked and recycled", 0),
            ("Light rain caused slippery walkway safety caution signboard placed immediately", 0)
        ]
        
        texts = [self._clean_text(t[0]) for t in corpus]
        labels = [t[1] for t in corpus]
        
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=500,
            sublinear_tf=True
        )
        X = self.vectorizer.fit_transform(texts)
        
        base_lr = LogisticRegression(C=2.0, class_weight="balanced", random_state=42)
        base_lr.fit(X, labels)
        self.model = base_lr
        
        joblib.dump(self.vectorizer, self.vectorizer_path)
        joblib.dump(self.model, self.model_path)

    def predict(self, text: str) -> dict:
        cleaned = self._clean_text(text)
        if not cleaned:
            return {
                "sif_prediction": False,
                "sif_probability": 0.05,
                "confidence": 0.95,
                "model_version": self.version,
                "top_features": []
            }
        
        # Rule-based safety signal modifier
        rule_boost = 0.0
        high_matches = [term for term in HIGH_SIF_TERMS if term in cleaned]
        non_matches = [term for term in NON_SIF_TERMS if term in cleaned]
        
        if len(high_matches) >= 2:
            rule_boost += 0.25
        elif len(high_matches) == 1:
            rule_boost += 0.15
            
        if len(non_matches) >= 1 and not high_matches:
            rule_boost -= 0.30

        # ML Model probability
        X = self.vectorizer.transform([cleaned])
        probs = self.model.predict_proba(X)[0]
        ml_prob = float(probs[1])
        
        # Combined calibrated probability
        final_prob = max(0.02, min(0.99, ml_prob + rule_boost))
        is_sif = final_prob >= settings.SIF_THRESHOLD
        
        # Feature importance / explainability tokens
        feature_names = self.vectorizer.get_feature_names_out()
        coefs = self.model.coef_[0]
        nonzero_idx = X.nonzero()[1]
        
        contributions = []
        for idx in nonzero_idx:
            word = feature_names[idx]
            weight = float(coefs[idx] * X[0, idx])
            contributions.append({"token": word, "weight": round(weight, 4)})
            
        contributions.sort(key=lambda x: abs(x["weight"]), reverse=True)
        confidence = round(max(final_prob, 1.0 - final_prob), 4)

        return {
            "sif_prediction": bool(is_sif),
            "sif_probability": round(final_prob, 4),
            "confidence": confidence,
            "model_version": self.version,
            "top_features": contributions[:8]
        }

    def retrain(self, texts, labels, new_version=None):
        cleaned_texts = [self._clean_text(t) for t in texts]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1000, sublinear_tf=True)
        X = self.vectorizer.fit_transform(cleaned_texts)
        self.model = LogisticRegression(C=2.0, class_weight="balanced", random_state=42)
        self.model.fit(X, labels)
        if new_version:
            self.version = new_version
        joblib.dump(self.vectorizer, self.vectorizer_path)
        joblib.dump(self.model, self.model_path)
        return True

sif_classifier = SIFClassifier()
