"""SQLAlchemy models for RegPilot AI.

All 7 entities for the SEBI stockbroker compliance compiler.
"""

from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, Date,
    ForeignKey, JSON,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # Compliance Officer, Legal Counsel, Tech Ops, etc.
    department = Column(String(100), nullable=False)


class RegulatoryDocument(Base):
    __tablename__ = "regulatory_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    document_type = Column(String(50), nullable=False)  # Master Circular, Circular, FAQ, Regulation
    source = Column(String(200), default="SEBI")
    circular_number = Column(String(100), nullable=True)
    issue_date = Column(Date, nullable=True)
    intermediary = Column(String(100), default="Stock Broker")
    status = Column(String(30), default="Uploaded")  # Uploaded, Processing, Analyzed, Reviewed
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=True)
    page_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")


class Clause(Base):
    __tablename__ = "clauses"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("regulatory_documents.id"), nullable=False)
    clause_number = Column(String(20), nullable=False)
    heading = Column(String(300), nullable=True)
    text = Column(Text, nullable=False)
    source_text = Column(Text, nullable=True)  # Original extracted text from PDF
    page_number = Column(Integer, nullable=True)
    risk_tags = Column(JSON, default=list)  # ["Technical Glitch", "Incident Reporting", ...]
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("RegulatoryDocument", back_populates="clauses")
    obligations = relationship("Obligation", back_populates="clause", cascade="all, delete-orphan")


class Obligation(Base):
    __tablename__ = "obligations"

    id = Column(Integer, primary_key=True, index=True)
    obligation_id = Column(String(20), unique=True, nullable=False)  # OBL-TG-001
    clause_id = Column(Integer, ForeignKey("clauses.id"), nullable=False)
    obligation_text = Column(Text, nullable=False)
    obligation_type = Column(String(50), nullable=False)  # Reporting, Operational, Documentation, Governance
    trigger_type = Column(String(50), nullable=False)  # Event-triggered, Recurring, One-time, Reporting
    intermediary = Column(String(100), default="Stock Broker")
    owner_role = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    deadline_rule = Column(String(200), nullable=True)
    required_evidence = Column(JSON, default=list)  # ["Incident ticket", "RCA document", ...]
    risk_level = Column(String(20), default="Medium")  # Critical, High, Medium, Low
    confidence_score = Column(Float, default=0.0)
    clause_trust_score = Column(Integer, default=0)  # 0-100
    status = Column(String(30), default="AI Draft")
    # Statuses: AI Draft, Needs Review, Approved, Rejected, Legal Review, Workflow Created
    human_review_required = Column(Boolean, default=True)
    grounded = Column(Boolean, default=True)
    source_citation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String(100), nullable=True)

    clause = relationship("Clause", back_populates="obligations")
    workflows = relationship("Workflow", back_populates="obligation", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="obligation", cascade="all, delete-orphan")
    audit_events = relationship(
        "AuditEvent",
        primaryjoin="and_(Obligation.id == foreign(AuditEvent.entity_id), AuditEvent.entity_type == 'obligation')",
        viewonly=True,
    )


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(20), unique=True, nullable=False)  # WF-TG-001
    obligation_id = Column(Integer, ForeignKey("obligations.id"), nullable=False)
    title = Column(String(300), nullable=False)
    owner = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String(30), default="Pending")  # Pending, In Progress, Completed, Overdue, Escalated
    escalation_level = Column(Integer, default=0)
    completion_percentage = Column(Integer, default=0)
    steps = Column(JSON, default=list)  # Workflow step definitions
    created_at = Column(DateTime, default=datetime.utcnow)

    obligation = relationship("Obligation", back_populates="workflows")
    evidence_items = relationship("Evidence", back_populates="workflow")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(String(20), unique=True, nullable=False)  # EV-001
    obligation_id = Column(Integer, ForeignKey("obligations.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    file_name = Column(String(300), nullable=False)
    evidence_type = Column(String(100), nullable=False)
    # Types: Incident ticket, Technical glitch report, RCA document,
    #        Corrective action plan, Exchange submission acknowledgement,
    #        System log, Management approval
    validation_status = Column(String(30), default="Pending")  # Pending, Accepted, Needs Review, Missing
    uploaded_by = Column(String(100), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    obligation = relationship("Obligation", back_populates="evidence_items")
    workflow = relationship("Workflow", back_populates="evidence_items")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # document, clause, obligation, workflow, evidence
    entity_id = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False)
    actor = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON, nullable=True)
