from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="HSE_OFFICER", nullable=False)
    site = Column(String(100), default="Duliajan")
    department = Column(String(100), default="HSE")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    
    reviews = relationship("HumanReview", back_populates="reviewer")

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    region = Column(String(100), nullable=False)
    site_type = Column(String(100), nullable=False)
    total_reports = Column(Integer, default=0)
    sif_reports = Column(Integer, default=0)
    sif_density = Column(Float, default=0.0)
    risk_level = Column(String(50), default="MODERATE")
    
    reports = relationship("Report", back_populates="site")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)

class LifeSavingRule(Base):
    __tablename__ = "life_saving_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Operational Safety")
    icon = Column(String(50), default="Shield")
    description = Column(Text, nullable=False)
    criticality_weight = Column(Float, default=1.0)
    total_violations = Column(Integer, default=0)
    sif_violations = Column(Integer, default=0)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_uid = Column(String(50), unique=True, index=True, nullable=False)
    report_type = Column(String(50), nullable=False)  # Unsafe Act, Unsafe Condition, Near Miss, Incident
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    site_name = Column(String(255), nullable=False)
    department_name = Column(String(255), default="Operations")
    date_time = Column(DateTime, default=utcnow)
    location = Column(String(255), nullable=False)
    activity = Column(String(255), nullable=False)
    equipment = Column(String(255), default="General Facility")
    worker_role = Column(String(255), default="Technician")
    shift = Column(String(50), default="Morning")
    contractor_involved = Column(Boolean, default=False)
    contractor_name = Column(String(255), nullable=True)
    raw_description = Column(Text, nullable=False)
    
    status = Column(String(50), default="Analyzed")  # Submitted, Analyzed, In Review, Validated, Closed
    severity = Column(String(50), default="MODERATE")  # LOW, MODERATE, HIGH, CRITICAL
    risk_score = Column(Float, default=0.0)
    sif_potential = Column(Boolean, default=False)
    sif_probability = Column(Float, default=0.0)
    
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    
    site = relationship("Site", back_populates="reports")
    analysis = relationship("ReportAnalysis", back_populates="report", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("HumanReview", back_populates="report", cascade="all, delete-orphan")

class ReportAnalysis(Base):
    __tablename__ = "report_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), unique=True, nullable=False)
    sif_prediction = Column(Boolean, default=False)
    sif_probability = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(50), default="LOW")
    likelihood_score = Column(Integer, default=2)
    severity_score = Column(Integer, default=2)
    model_version = Column(String(100), default="sif-sentinel-v1.4")
    
    rule_signals = Column(JSON, default=list)
    entity_extraction = Column(JSON, default=dict)
    explainability = Column(JSON, default=dict)
    similar_reports = Column(JSON, default=list)
    analyzed_at = Column(DateTime, default=utcnow)
    
    report = relationship("Report", back_populates="analysis")

class ReportRuleMapping(Base):
    __tablename__ = "report_rule_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    rule_id = Column(Integer, ForeignKey("life_saving_rules.id"), nullable=False)
    confidence = Column(Float, default=0.0)
    is_validated = Column(Boolean, default=False)

class PrecursorPattern(Base):
    __tablename__ = "precursor_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    pattern_key = Column(String(255), unique=True, index=True, nullable=False)
    activity = Column(String(100), nullable=False)
    hazard = Column(String(100), nullable=False)
    barrier_failure = Column(String(100), nullable=False)
    equipment = Column(String(100), default="Rotating Equipment")
    location = Column(String(100), default="Plant Area")
    occurrence_count = Column(Integer, default=1)
    sif_count = Column(Integer, default=0)
    sif_association_rate = Column(Float, default=0.0)
    risk_level = Column(String(50), default="HIGH")
    trend = Column(String(50), default="Increasing")
    affected_sites = Column(JSON, default=list)
    last_detected_at = Column(DateTime, default=utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_uid = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), default="OPEN")  # OPEN, ACKNOWLEDGED, RESOLVED
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=True)
    site_name = Column(String(255), nullable=False)
    activity = Column(String(100), nullable=False)
    hazard = Column(String(100), nullable=False)
    sif_probability = Column(Float, default=0.0)
    assigned_to = Column(String(255), default="HSE Officer")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    resolved_at = Column(DateTime, nullable=True)

class HumanReview(Base):
    __tablename__ = "human_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_name = Column(String(255), nullable=False)
    original_sif = Column(Boolean, nullable=False)
    reviewed_sif = Column(Boolean, nullable=False)
    original_risk = Column(String(50), nullable=False)
    reviewed_risk = Column(String(50), nullable=False)
    edited_rules = Column(JSON, default=list)
    edited_entities = Column(JSON, default=dict)
    review_comment = Column(Text, nullable=True)
    status = Column(String(50), default="APPROVED")  # APPROVED, MODIFIED, REJECTED
    reviewed_at = Column(DateTime, default=utcnow)
    
    report = relationship("Report", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String(100), unique=True, nullable=False)
    model_type = Column(String(100), nullable=False)
    trained_at = Column(DateTime, default=utcnow)
    sample_count = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1 = Column(Float, default=0.0)
    pr_auc = Column(Float, default=0.0)
    roc_auc = Column(Float, default=0.0)
    false_negative_rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    confusion_matrix = Column(JSON, default=dict)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_role = Column(String(50), default="ALL")
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")  # CRITICAL, WARNING, INFO, SUCCESS
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(JSON, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=utcnow)
