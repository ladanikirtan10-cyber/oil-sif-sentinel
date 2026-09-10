import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath("backend"))
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_demo_auth_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "hse@oil-demo.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "HSE_OFFICER"

def test_demo_role_switch():
    response = client.post("/api/v1/auth/demo-switch", json={"role": "ADMIN"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "ADMIN"

def test_dashboard_kpis():
    response = client.get("/api/v1/dashboard/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_reports" in data
    assert "sif_reports" in data
    assert "sif_rate" in data
    assert data["total_reports"] > 0

def test_dashboard_charts():
    response = client.get("/api/v1/dashboard/charts")
    assert response.status_code == 200
    data = response.json()
    assert "reports_by_type" in data
    assert "sif_by_site" in data
    assert "sif_by_activity" in data
    assert "rule_violations" in data

def test_reports_list():
    response = client.get("/api/v1/reports?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0

def test_create_and_analyze_report_sih_example():
    sample_text = "During maintenance activity, a technician entered the compressor area while equipment was energized. Lockout/tagout had not been completed and another employee was standing near the rotating coupling."
    
    response = client.post("/api/v1/reports", json={
        "report_type": "Unsafe Act",
        "site_name": "Duliajan Central Field",
        "department_name": "Maintenance",
        "location": "Compressor Area 3",
        "activity": "Maintenance",
        "equipment": "Centrifugal Compressor",
        "worker_role": "Mechanical Technician",
        "shift": "Morning",
        "contractor_involved": False,
        "raw_description": sample_text
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["sif_potential"] is True
    assert data["sif_probability"] >= 0.85
    assert data["risk_level"] in ["CRITICAL", "HIGH"]
    
    # Verify analysis details
    analysis = data["analysis"]
    assert "entity_extraction" in analysis
    entities = analysis["entity_extraction"]
    assert "Maintenance" in entities["activity"]
    assert any("Rotating" in h or "Unexpected" in h for h in entities["hazards"])
    assert any("Lockout" in b or "LOTO" in b for b in entities["barrier_failures"])
    
    # Verify Life-Saving Rules
    rule_names = [r["rule_name"] for r in analysis["rule_signals"]]
    assert "Energy Isolation" in rule_names

def test_precursor_patterns():
    response = client.get("/api/v1/precursors")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "sif_association_rate" in data[0]

def test_life_saving_rules():
    response = client.get("/api/v1/rules")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 9
    rule_codes = [r["code"] for r in data]
    assert "LSR-01" in rule_codes
    assert "LSR-04" in rule_codes

def test_semantic_search():
    response = client.post("/api/v1/search/semantic", json={
        "query": "Show incidents involving energy isolation failures during maintenance."
    })
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) > 0
    assert "similarity" in data["results"][0]

def test_ai_safety_assistant():
    response = client.post("/api/v1/assistant/chat", json={
        "query": "What are the most common SIF precursors?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 50

def test_model_metrics_and_retrain():
    response = client.get("/api/v1/models/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["recall"] >= 95.0
    
    retrain_res = client.post("/api/v1/models/retrain")
    assert retrain_res.status_code == 200
    retrain_data = retrain_res.json()
    assert retrain_data["status"] == "success"

def test_alerts_lifecycle():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0
    
    first_id = alerts[0]["id"]
    ack_res = client.post(f"/api/v1/alerts/{first_id}/acknowledge", json={"assigned_to": "Field HSE Lead"})
    assert ack_res.status_code == 200
