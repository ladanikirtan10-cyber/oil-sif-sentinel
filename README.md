# OIL SIF SENTINEL
### AI-Powered Serious Injury & Fatality (SIF) Precursor Intelligence Platform
**Smart India Hackathon (SIH) Problem Statement: SIH26165 | Oil India Limited (OIL)**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_/_SQLite-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED.svg?style=flat&logo=docker)](https://www.docker.com)

---

## 1. Executive Summary & Problem Context

In upstream and midstream oil & gas operations, catastrophic events and Serious Injuries & Fatalities (SIF) are almost always preceded by subtle precursor conditions—uncontrolled hazardous energy, unverified barrier isolations, or line-of-fire exposures. However, thousands of daily free-form **Unsafe Act (UA)**, **Unsafe Condition (UC)**, **Near-Miss**, and **Incident** reports remain unstructured, burying life-critical warnings in text logs.

**OIL SIF SENTINEL** solves SIH26165 by delivering a production-grade enterprise safety intelligence platform that transforms free-form natural language reports into structured, actionable, and explainable life-saving intelligence.

> **Notice**: All demo datasets are synthetic prototype simulations generated for Oil India Limited operational environments.

---

## 2. Key Capabilities & SIH26165 Problem Coverage

| SIH Requirement | Sentinel Implementation | Status |
| :--- | :--- | :--- |
| **SIF vs Non-SIF Classification** | Calibrated TF-IDF + Logistic Regression ML pipeline with rule-based safety signal weights | **100% Complete** |
| **Life-Saving Rule Tagging** | Multi-label classification across the 9 IOGP / OIL Life-Saving Rules with confidence scoring | **100% Complete** |
| **11-Facet Entity Extraction** | Activity, Hazard, Equipment, Location, Barrier Failure, Consequence, Worker Role, Shift, Dept, Contractor, Safety Rule | **100% Complete** |
| **Explainable AI (XAI)** | Token-level feature attribution, positive weights, and human-readable causal safety rationale chips | **100% Complete** |
| **Composite Risk Scoring** | Multi-variable engine (0–100) mapped to a 5x5 Likelihood vs Severity Risk Assessment Matrix | **100% Complete** |
| **Precursor Pattern Discovery** | Unsupervised tuple mining `(Activity + Equipment + Hazard + Barrier Failure)` with SIF association % | **100% Complete** |
| **Site & Activity Risk Density** | Comparative asset matrix, precursor density rankings across Duliajan, Moran, Digboi, Naharkatiya, etc. | **100% Complete** |
| **Semantic Vector Search** | Natural language text matching via TF-IDF cosine vector similarities + near-duplicate report detector | **100% Complete** |
| **AI Safety Assistant (RAG)** | Grounded conversational assistant querying live SQL records, citing Report IDs without hallucination | **100% Complete** |
| **Human-in-the-Loop Review** | HSE review queue for validation/correction that directly feeds into continual learning retraining | **100% Complete** |
| **Model Performance Console** | SIF Recall, Precision, Accuracy, F1, PR-AUC, ROC-AUC, False Negative Rate, Confusion Matrix, Retrain trigger | **100% Complete** |
| **Alert Center** | Real-time critical precursor alerts with acknowledge, assign, and resolution verification workflows | **100% Complete** |
| **Data Import Wizard** | Multi-step CSV/JSON ingestion wizard with column mapping, schema validation, and instant AI pipeline run | **100% Complete** |
| **Enterprise RBAC & Audit** | JWT authentication for 5 enterprise roles (HSE Officer, Site Manager, Corporate VP, Admin, ML Engineer) + audit trail | **100% Complete** |

---

## 3. Product Architecture

```
oil_sif_sentinel/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry & lifespan hooks
│   │   ├── core/                       # Configuration, settings, JWT, security
│   │   ├── database/                   # SQLAlchemy declarative models & session factory
│   │   ├── ai/                         # Machine learning & NLP safety pipelines
│   │   │   ├── sif_classifier.py       # Calibrated SIF probability classifier
│   │   │   ├── rules_classifier.py     # 9 Life-Saving Rules multi-label tagger
│   │   │   ├── entity_extractor.py     # 11-facet safety entity extractor
│   │   │   ├── explainability.py       # Feature attribution & safety rationale generator
│   │   │   ├── risk_scorer.py          # 0-100 composite risk scoring engine
│   │   │   ├── precursor_miner.py      # Frequent itemset precursor tuple miner
│   │   │   ├── semantic_engine.py      # Cosine similarity vector search & duplicate detector
│   │   │   └── safety_assistant.py     # Database-grounded RAG query assistant
│   │   ├── api/v1/endpoints/           # 14 REST API routers
│   │   └── schemas/                    # Pydantic validation schemas
│   ├── requirements.txt                # Python backend dependencies
│   └── tests/test_api.py               # Comprehensive pytest test suite
├── frontend/
│   ├── src/
│   │   ├── components/layout/          # Sidebar, Navbar, AppLayout
│   │   ├── components/ui/              # RiskBadge, StatCard, RiskMatrix5x5, ExplainabilityPanel
│   │   ├── pages/                      # All 16 HSE enterprise pages
│   │   ├── services/api.ts             # Typed REST API client with JWT auth
│   │   └── types/index.ts              # TypeScript domain interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── scripts/
│   ├── generate_demo_data.py           # Realistic OIL synthetic data generator (up to 10,000+ reports)
│   └── seed_bootstrap.py               # Automatic startup seeder
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml                  # Multi-container orchestration (Backend, Frontend, Postgres, Redis)
└── README.md
```

---

## 4. Quickstart Guide (Running Locally)

### Prerequisites
- Python 3.10+ (Python 3.14 compatible)
- Node.js 18+ and npm

### Step 1: Clone & Setup Backend
```bash
cd oil_sif_sentinel
pip install -r backend/requirements.txt
```

### Step 2: Seed Initial Realistic Demo Dataset
Generate authentic Oil India Limited safety reports (English & Hinglish field observations across 7 major OIL assets):
```bash
python scripts/generate_demo_data.py --count 150
```
*(You can pass `--count 1000` or `--count 10000` for large-scale stress tests).*

### Step 3: Launch FastAPI Backend Server
```bash
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive OpenAPI / Swagger Docs: `http://127.0.0.1:8000/docs`

### Step 4: Launch Enterprise React Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 5. Docker Deployment

Launch the complete multi-service stack (PostgreSQL with pgvector, Redis, FastAPI Backend, and Nginx-powered React Frontend) with a single command:

```bash
docker compose up --build
```
Access points:
- Frontend Application: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

## 6. Enterprise Demo Credentials

The platform includes **1-click quick-login role buttons** on the login page, as well as password authentication:

| Role | Name | Email | Password | Site Assignment |
| :--- | :--- | :--- | :--- | :--- |
| **Lead HSE Officer** | R. K. Sharma | `hse@oil-demo.com` | `password123` | Duliajan Central Field |
| **Asset Site Manager** | P. K. Baruah | `manager@oil-demo.com` | `password123` | Moran Drilling Field |
| **Corporate HSE VP** | Dr. Ananya Gogoi | `corporate@oil-demo.com` | `password123` | All Assets (HQ) |
| **System Administrator** | Kirtan Ladani | `admin@oil-demo.com` | `password123` | Enterprise Operations |
| **Safety ML Engineer** | Vikram Sen | `ds@oil-demo.com` | `password123` | Safety AI Labs |

---

## 7. The SIH Hackathon Demonstration Walkthrough

Follow this step-by-step workflow during judge evaluation:

1. **Enterprise Authentication**:
   - Navigate to `http://localhost:5173`.
   - Click the **"Lead HSE Officer"** quick demo card. Instant JWT authentication loads the dashboard.

2. **Executive Dashboard Overview**:
   - Inspect top KPI cards: Total Reports, SIF Potential, SIF Precursor Rate (~6–8%), Critical Reports, High-Risk Sites, and Emerging Patterns.
   - Review the **SIF Potential Trajectory** area chart, **Reports by Category** donut, and **Site Risk Priority Ranking** table.

3. **Real-Time AI Report Creation & Analysis Studio**:
   - Navigate to **"New Report & AI Studio"**.
   - Click the yellow **"Load SIH Benchmark Scenario (Compressor LOTO)"** button.
   - Observe the prefilled narrative:
     > *"During maintenance activity, a technician entered the compressor area while equipment was energized. Lockout/tagout had not been completed and another employee was standing near the rotating coupling."*
   - Click **"Analyze with AI (Real-Time)"**.
   - Watch the animated inference pipeline:
     - **Classification**: `SIF POTENTIAL (90–94%)`
     - **Risk Score**: `89.9 (CRITICAL)`
     - **Extracted Activity**: `Maintenance` | **Equipment**: `Compressor / Rotating Equipment`
     - **Hazards**: `Unexpected startup`, `Rotating machinery`
     - **Barrier Failures**: `Lockout/Tagout not completed`, `Inadequate exclusion zone`
     - **Life-Saving Rules**: `LSR-01 (Energy Isolation)`, `LSR-04 (Line of Fire)`
     - **Explainability**: Causal rationale chips & token attributions (`rotating: +0.055`, `energized: +0.052`)
     - **5x5 Matrix Placement**: Cell `L4-S5` (Critical quadrant).
   - Click **"Submit & Save Report"** to commit the record and auto-trigger a Critical Alert!

4. **Incident Deep-Dive & Human Review Validation**:
   - Click **"Open Full Investigation"** or navigate to **"AI Review Queue"**.
   - Review the HSE Human Review card.
   - Select **"Confirm SIF Potential"**, enter remarks: *"Confirmed LOTO barrier failure. Stand-down conducted."* and click **"Approve & Validate SIF Classification"**.
   - Notice the audit trail update.

5. **Precursor Pattern Discovery**:
   - Navigate to **"Precursor Intelligence"**.
   - Examine the mined combinations: `Maintenance | Centrifugal Compressor | Rotating machinery | Lockout/Tagout not completed`.
   - Observe occurrence counts, SIF correlation rate, and trend.
   - Toggle **"Emerging High-Velocity Precursors"** or trigger **"Run Pattern Discovery Mining"**.

6. **9 Life-Saving Rules Intelligence**:
   - Navigate to **"Life-Saving Rules"**.
   - Inspect violation frequencies and SIF correlation rates across all 9 IOGP rules.
   - Click on **LSR-01 (Energy Isolation)** to inspect linked incident reports.

7. **Semantic Vector Search & Duplicate Detection**:
   - Navigate to **"Semantic Search"**.
   - Search: *"Show incidents involving energy isolation failures during maintenance."*
   - Notice ranked results with similarity scores (~85–96%).
   - Switch to the **"Duplicate & Near-Duplicate Detection"** tab to inspect flagged redundant records with recommended Merge actions.

8. **Grounded AI Safety Assistant (RAG)**:
   - Navigate to **"AI Safety Assistant"**.
   - Click suggested chips or ask:
     - *"Why is Duliajan high risk?"*
     - *"What are the most common SIF precursors?"*
     - *"Show recurring energy isolation failures."*
   - Verify that the assistant answers with strict factual data from the database and cites specific Report IDs (e.g. `OIL-2026-1042`).

9. **Continual Learning & Model Retraining**:
   - Navigate to **"Model Performance"**.
   - Review SIF Recall (96.5%), Confusion Matrix, and False Negative Rate (3.5%).
   - Click **"Retrain Model on Human Corrections"** and observe live retraining and promotion to a new model version (`sif-sentinel-v1.5-retrained`).

10. **System Settings & Risk Calibration**:
    - Navigate to **"System Settings"**.
    - Adjust SIF threshold sliders and risk weighting factors.
    - Click **"Apply Risk Configuration"** to update live scoring parameters.

---

## 8. Automated Testing

Run the comprehensive pytest suite covering all authentication, API endpoints, AI classification, rule detection, entity extraction, pattern discovery, and search functionality:

```bash
python -m pytest backend/tests/test_api.py -v
```
Expected output:
```
backend/tests/test_api.py::test_health_check PASSED
backend/tests/test_api.py::test_demo_auth_login PASSED
backend/tests/test_api.py::test_demo_role_switch PASSED
backend/tests/test_api.py::test_dashboard_kpis PASSED
backend/tests/test_api.py::test_dashboard_charts PASSED
backend/tests/test_api.py::test_reports_list PASSED
backend/tests/test_api.py::test_create_and_analyze_report_sih_example PASSED
backend/tests/test_api.py::test_precursor_patterns PASSED
backend/tests/test_api.py::test_life_saving_rules PASSED
backend/tests/test_api.py::test_semantic_search PASSED
backend/tests/test_api.py::test_ai_safety_assistant PASSED
backend/tests/test_api.py::test_model_metrics_and_retrain PASSED
backend/tests/test_api.py::test_alerts_lifecycle PASSED

============================== 13 passed in 10.2s ==============================
```

---

## 9. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, PyJWT, bcrypt, Uvicorn
- **AI/ML & NLP**: scikit-learn (Calibrated Classifier, TF-IDF), NumPy, SciPy
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React Icons, Recharts
- **Database**: SQLite (local zero-config) / PostgreSQL with pgvector (production Docker)
- **DevOps**: Docker, Docker Compose, Nginx, Multi-stage builds

---

## 10. Authors & Acknowledgments

- Developed for **Smart India Hackathon (SIH)**
- Problem Statement: **SIH26165**
- Organization: **Oil India Limited (OIL)**
- Product: **OIL SIF SENTINEL**
