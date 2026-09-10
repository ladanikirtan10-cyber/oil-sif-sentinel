from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class DemoSwitchRequest(BaseModel):
    role: str  # HSE_OFFICER, SITE_MANAGER, CORPORATE_HSE, ADMIN, DATA_SCIENTIST

# User
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    site: str
    department: str
    is_active: bool

    class Config:
        from_attributes = True

# Report
class ReportCreate(BaseModel):
    report_type: str = "Unsafe Act"  # Unsafe Act, Unsafe Condition, Near Miss, Incident
    site_name: str = "Duliajan Central Field"
    department_name: str = "Maintenance"
    date_time: Optional[datetime] = None
    location: str = "Compressor Area 3"
    activity: str = "Maintenance"
    equipment: str = "Centrifugal Compressor"
    worker_role: str = "Mechanical Technician"
    shift: str = "Morning"
    contractor_involved: bool = False
    contractor_name: Optional[str] = None
    raw_description: str

class ReportResponse(BaseModel):
    id: int
    report_uid: str
    report_type: str
    site_name: str
    department_name: str
    date_time: datetime
    location: str
    activity: str
    equipment: str
    worker_role: str
    shift: str
    contractor_involved: bool
    contractor_name: Optional[str]
    raw_description: str
    status: str
    severity: str
    risk_score: float
    sif_potential: bool
    sif_probability: float
    created_at: datetime

    class Config:
        from_attributes = True

class ReportDetailResponse(ReportResponse):
    analysis: Optional[Dict[str, Any]] = None
    reviews: Optional[List[Dict[str, Any]]] = None

# Analysis
class AnalyzeTextRequest(BaseModel):
    raw_description: str
    activity: Optional[str] = None
    location: Optional[str] = None
    equipment: Optional[str] = None
    worker_role: Optional[str] = None
    contractor_involved: Optional[bool] = False

class AnalysisResult(BaseModel):
    sif_prediction: bool
    sif_probability: float
    confidence: float
    risk_score: float
    risk_level: str
    likelihood_score: int
    severity_score: int
    model_version: str
    rule_signals: List[Dict[str, Any]]
    entity_extraction: Dict[str, Any]
    explainability: Dict[str, Any]
    similar_reports: List[Dict[str, Any]]

# Human Review
class HumanReviewCreate(BaseModel):
    report_id: int
    reviewed_sif: bool
    reviewed_risk: str
    edited_rules: Optional[List[str]] = None
    edited_entities: Optional[Dict[str, Any]] = None
    review_comment: Optional[str] = None
    status: str = "APPROVED"  # APPROVED, MODIFIED, REJECTED

# Alert
class AlertResponse(BaseModel):
    id: int
    alert_uid: str
    title: str
    description: str
    priority: str
    status: str
    report_id: Optional[int]
    site_name: str
    activity: str
    hazard: str
    sif_probability: float
    assigned_to: Optional[str]
    resolution_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

# Precursor Pattern
class PrecursorPatternResponse(BaseModel):
    id: int
    pattern_key: str
    activity: str
    hazard: str
    barrier_failure: str
    equipment: str
    location: str
    occurrence_count: int
    sif_count: int
    sif_association_rate: float
    risk_level: str
    trend: str
    affected_sites: List[str]
    last_detected_at: datetime

    class Config:
        from_attributes = True

# Life-Saving Rule
class LifeSavingRuleResponse(BaseModel):
    id: int
    code: str
    name: str
    category: str
    icon: str
    description: str
    criticality_weight: float
    total_violations: int
    sif_violations: int

    class Config:
        from_attributes = True

# Semantic Search
class SemanticSearchRequest(BaseModel):
    query: str
    top_k: int = 15

# Assistant
class AssistantQueryRequest(BaseModel):
    query: str

class AssistantQueryResponse(BaseModel):
    answer: str
    source_reports: List[Dict[str, Any]]
    data_points: Dict[str, Any]
