# OIL SIF SENTINEL
### AI-Powered Serious Injury & Fatality (SIF) Precursor Intelligence Platform
**Smart India Hackathon (SIH 2026) Project | Problem Statement: SIH26165 | Oil India Limited (OIL)**

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-SIH%202026-FF9933.svg?style=for-the-badge)](https://sih.gov.in)
[![Vercel Deployment](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-000000.svg?style=for-the-badge&logo=vercel)](https://oil-sif-sentinel-sigma.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717.svg?style=for-the-badge&logo=github)](https://github.com/ladanikirtan10-cyber/oil-sif-sentinel)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![OpenCV](https://img.shields.io/badge/CV-OpenCV_Real--Time-5C3EE8.svg?style=flat&logo=opencv)](https://opencv.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_/_SQLite-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)

---

## 🚀 Live Deployment & Links

| Service | Access Link | Description |
| :--- | :--- | :--- |
| **🌐 Live Vercel App** | **[https://oil-sif-sentinel-sigma.vercel.app](https://oil-sif-sentinel-sigma.vercel.app)** | Production frontend deployed on Vercel |
| **📹 AI Camera Surveillance** | **[https://oil-sif-sentinel-sigma.vercel.app/camera-safety](https://oil-sif-sentinel-sigma.vercel.app/camera-safety)** | Live 30 FPS Computer Vision worker tracking & PPE inspection |
| **📂 GitHub Repository** | **[https://github.com/ladanikirtan10-cyber/oil-sif-sentinel](https://github.com/ladanikirtan10-cyber/oil-sif-sentinel)** | Complete open-source project repository |
| **⚡ Vercel Project Dashboard** | **[https://vercel.com/kirtan-s-projects4/oil-sif-sentinel](https://vercel.com/kirtan-s-projects4/oil-sif-sentinel)** | CI/CD build logs, deployments, and analytics |

---

## 1. Executive Summary & SIH 2026 Context

In upstream and midstream oil & gas operations, catastrophic events and Serious Injuries & Fatalities (SIF) are almost always preceded by subtle precursor conditions—uncontrolled hazardous energy, unverified barrier isolations, lack of required Personal Protective Equipment (PPE), or line-of-fire exposures. However, thousands of daily free-form **Unsafe Act (UA)**, **Unsafe Condition (UC)**, **Near-Miss**, and **Incident** reports remain unstructured, burying life-critical warnings in text logs.

Developed for **Smart India Hackathon (SIH 2026)** under Problem Statement **SIH26165** for **Oil India Limited (OIL)**, **OIL SIF SENTINEL** transforms oilfield safety from reactive reporting into an active, automated life-saving ecosystem:
1. **Natural Language SIF Precursor Intelligence**: Automates unstructured safety incident classification, entity extraction, causal explainability, and precursor tuple mining.
2. **AI-Powered Live Camera Safety Surveillance**: Real-time 30 FPS computer vision monitoring that detects workers, tracks PPE compliance (safety helmets, reflective vests), detects perimeter danger zone intrusions, and triggers automated zero-touch incident logging.
3. **Full Multilingual Localization**: Complete native language support (English, Hindi, Assamese) enabling frontline oilfield technicians and engineers across Assam and northeast assets to report and monitor hazards in their native languages.

> **Notice**: All demo datasets are synthetic prototype simulations generated for Oil India Limited operational environments.

---

## 2. Key Capabilities & SIH26165 Problem Coverage

| SIH Requirement | Sentinel Implementation | Status |
| :--- | :--- | :--- |
| **AI Safety Camera Surveillance** | Real-time 15–30 FPS in-browser + server-side computer vision tracking, AR head scanner arc, dynamic bounding boxes, and perimeter danger zone corridor | **100% Complete** |
| **PPE Compliance Detection** | Certified safety helmet detection across industrial colors (Yellow, White, Orange, Red, Blue, Green) + high-visibility reflective safety vest detection | **100% Complete** |
| **Zero-Touch Incident Automation** | Automatic HSE incident generation (`OIL-CAM-2026-XXXX`) & critical alert creation in SQLite with 30-second de-duplication cooldown | **100% Complete** |
| **Multilingual Platform (3 Languages)** | Dynamic runtime switching between **English**, **हिंदी (Hindi)**, and **অসমীয়া (Assamese)** across all 16 pages and components | **100% Complete** |
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
| **Alert Center & Voice Alerts** | Real-time critical precursor alerts with text-to-speech voice announcements, assignment, and resolution verification | **100% Complete** |
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
│   │   ├── ai/                         # Machine learning & Computer Vision pipelines
│   │   │   ├── vision_detector.py      # Real-time CV PPE & Worker surveillance engine
│   │   │   ├── sif_classifier.py       # Calibrated SIF probability classifier
│   │   │   ├── rules_classifier.py     # 9 Life-Saving Rules multi-label tagger
│   │   │   ├── entity_extractor.py     # 11-facet safety entity extractor
│   │   │   ├── explainability.py       # Feature attribution & safety rationale generator
│   │   │   ├── risk_scorer.py          # 0-100 composite risk scoring engine
│   │   │   ├── precursor_miner.py      # Frequent itemset precursor tuple miner
│   │   │   ├── semantic_engine.py      # Cosine similarity vector search & duplicate detector
│   │   │   └── safety_assistant.py     # Database-grounded RAG query assistant
│   │   ├── api/v1/endpoints/           # 15 REST API routers (including /camera)
│   │   └── schemas/                    # Pydantic validation schemas
│   ├── requirements.txt                # Python backend dependencies
│   └── tests/test_api.py               # Comprehensive pytest test suite
├── frontend/
│   ├── src/
│   │   ├── components/layout/          # Sidebar, Navbar, AppLayout
│   │   ├── components/ui/              # RiskBadge, StatCard, RiskMatrix5x5, VoiceWaveVisualizer
│   │   ├── i18n/                       # Multilingual translations (English, Hindi, Assamese)
│   │   ├── pages/                      # All 17 pages (including CameraSafetyPage.tsx)
│   │   ├── services/api.ts             # Typed REST API client with JWT auth
│   │   ├── utils/                      # Voice assistant & speech synthesizer
│   │   └── types/index.ts              # TypeScript domain interfaces
│   ├── public/                         # Static assets & test scenarios
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json                     # Vercel deployment configuration
├── vercel.json                         # Root Vercel monorepo configuration
├── start_project.bat                   # 1-Click Windows startup script
├── docker-compose.yml                  # Multi-container orchestration (Backend, Frontend, Postgres, Redis)
└── README.md
```

---

## 4. Quickstart Guide (Running Locally)

### Prerequisites
- Python 3.10+ (Python 3.14 compatible)
- Node.js 18+ and npm

### 1-Click Startup (Windows)
Double-click `start_project.bat` in the project root to automatically launch both the FastAPI backend and Vite frontend!

---

### Manual Setup

#### Step 1: Clone & Setup Backend
```bash
git clone https://github.com/ladanikirtan10-cyber/oil-sif-sentinel.git
cd oil-sif-sentinel
pip install -r backend/requirements.txt
```

#### Step 2: Seed Initial Realistic Demo Dataset
```bash
python scripts/generate_demo_data.py --count 150
```

#### Step 3: Launch FastAPI Backend Server
```bash
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

#### Step 4: Launch Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 5. Live AI Camera Safety Surveillance Workflow

The camera safety system automates the complete cycle:
$$\text{Camera Frame} \longrightarrow \text{AI Detection} \longrightarrow \text{Violation Confirmed} \longrightarrow \text{HSE Incident Logged} \longrightarrow \text{Alert Center Dispatched}$$

1. Open **[http://localhost:5173/camera-safety](http://localhost:5173/camera-safety)** (or live on Vercel: **[https://oil-sif-sentinel-sigma.vercel.app/camera-safety](https://oil-sif-sentinel-sigma.vercel.app/camera-safety)**).
2. Click **Start Camera** to initialize live video surveillance.
3. The real-time Computer Vision engine:
   - Tracks worker body centroids with adaptive skin chrominance.
   - Evaluates cranial crown dome above the brow line for certified safety helmets.
   - Evaluates torso region for high-visibility reflective safety vests.
   - Monitors perimeter danger zone corridors.
4. **When Compliant**: Displays a green bounding box and `✓ Safety Helmet: Detected` / `✓ Safety Vest: Detected`.
5. **When a Violation Occurs**:
   - Displays a red bounding box and alerts `❌ Safety Helmet: Missing`.
   - Automatically records an official HSE incident in the database (`OIL-CAM-2026-XXXX`).
   - Dispatches a prioritized safety alert (`ALT-CAM-2026-XXXX`).
   - Plays an automated audio voice announcement.
   - Applies a 30-second de-duplication cooldown to prevent alert flooding.

---

## 6. Enterprise Demo Credentials

| Role | Name | Email | Password | Site Assignment |
| :--- | :--- | :--- | :--- | :--- |
| **Lead HSE Officer** | R. K. Sharma | `hse@oil-demo.com` | `password123` | Duliajan Central Field |
| **Asset Site Manager** | P. K. Baruah | `manager@oil-demo.com` | `password123` | Moran Drilling Field |
| **Corporate HSE VP** | Dr. Ananya Gogoi | `corporate@oil-demo.com` | `password123` | All Assets (HQ) |
| **System Administrator** | Kirtan Ladani | `admin@oil-demo.com` | `password123` | Enterprise Operations |
| **Safety ML Engineer** | Vikram Sen | `ds@oil-demo.com` | `password123` | Safety AI Labs |

---

## 7. Technology Stack

- **Cloud Deployment**: Vercel (Production CI/CD), Docker, Nginx
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Recharts, KaTeX
- **Computer Vision & AI/ML**: OpenCV, scikit-learn (Calibrated Classifiers, TF-IDF), NumPy, SciPy
- **Backend API**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, PyJWT
- **Database**: SQLite (Zero-config local) / PostgreSQL with pgvector (Enterprise Docker)
- **Localization**: Custom i18n context (English, Hindi, Assamese)

---

## 8. Authors & Acknowledgments

- **Hackathon**: **Smart India Hackathon (SIH 2026)**
- **Problem Statement**: **SIH26165**
- **Organization**: **Oil India Limited (OIL)**
- **Project Name**: **OIL SIF SENTINEL**
- **Author**: **Kirtan Ladani** ([@ladanikirtan10-cyber](https://github.com/ladanikirtan10-cyber))
- **Live Deployment**: [https://oil-sif-sentinel-sigma.vercel.app](https://oil-sif-sentinel-sigma.vercel.app)
- **GitHub Repository**: [https://github.com/ladanikirtan10-cyber/oil-sif-sentinel](https://github.com/ladanikirtan10-cyber/oil-sif-sentinel)
