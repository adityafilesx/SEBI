"""Pydantic schemas for request/response validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


# ── Document schemas ──────────────────────────────────────────

class DocumentOut(BaseModel):
    id: int
    title: str
    document_type: str
    source: str
    circular_number: Optional[str] = None
    issue_date: Optional[date] = None
    intermediary: str
    status: str
    file_path: Optional[str] = None
    page_count: int
    created_at: datetime
    clause_count: int = 0
    obligation_count: int = 0

    class Config:
        from_attributes = True


class DocumentDetail(DocumentOut):
    raw_text: Optional[str] = None
    clauses: list["ClauseOut"] = []


# ── Clause schemas ────────────────────────────────────────────

class ClauseOut(BaseModel):
    id: int
    document_id: int
    clause_number: str
    heading: Optional[str] = None
    text: str
    source_text: Optional[str] = None
    page_number: Optional[int] = None
    risk_tags: list[str] = []
    created_at: datetime
    obligation_count: int = 0

    class Config:
        from_attributes = True


# ── Obligation schemas ────────────────────────────────────────

class ObligationOut(BaseModel):
    id: int
    obligation_id: str
    clause_id: int
    obligation_text: str
    obligation_type: str
    trigger_type: str
    intermediary: str
    owner_role: Optional[str] = None
    department: Optional[str] = None
    deadline_rule: Optional[str] = None
    required_evidence: list[str] = []
    risk_level: str
    confidence_score: float
    clause_trust_score: int
    status: str
    human_review_required: bool
    grounded: bool
    source_citation: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    # Computed fields
    evidence_uploaded: int = 0
    evidence_required: int = 0
    evidence_completeness: float = 0.0

    class Config:
        from_attributes = True


class ObligationDetail(ObligationOut):
    clause: Optional[ClauseOut] = None
    evidence_items: list["EvidenceOut"] = []
    audit_trail: list["AuditEventOut"] = []


class ObligationUpdate(BaseModel):
    obligation_text: Optional[str] = None
    owner_role: Optional[str] = None
    department: Optional[str] = None
    deadline_rule: Optional[str] = None
    risk_level: Optional[str] = None


# ── Workflow schemas ──────────────────────────────────────────

class WorkflowOut(BaseModel):
    id: int
    workflow_id: str
    obligation_id: int
    title: str
    owner: Optional[str] = None
    department: Optional[str] = None
    due_date: Optional[date] = None
    status: str
    escalation_level: int
    completion_percentage: int
    steps: list[dict] = []
    created_at: datetime
    linked_obligation_id: str = ""

    class Config:
        from_attributes = True


# ── Evidence schemas ──────────────────────────────────────────

class EvidenceOut(BaseModel):
    id: int
    evidence_id: str
    obligation_id: int
    workflow_id: Optional[int] = None
    file_name: str
    evidence_type: str
    validation_status: str
    uploaded_by: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ── Audit schemas ─────────────────────────────────────────────

class AuditEventOut(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    actor: Optional[str] = None
    timestamp: datetime
    details: Optional[dict] = None

    class Config:
        from_attributes = True


# ── Gap schemas (computed) ────────────────────────────────────

class GapOut(BaseModel):
    gap_id: str
    obligation_id: str
    obligation_text: str
    gap_type: str  # missing_evidence, no_owner, overdue, low_confidence, needs_legal
    severity: str  # Critical, High, Medium, Low
    reason: str
    suggested_remediation: str
    owner: Optional[str] = None
    due_date: Optional[date] = None


class RemediationPlan(BaseModel):
    gap_id: str
    steps: list[dict]


# ── Dashboard schemas ─────────────────────────────────────────

class DashboardMetrics(BaseModel):
    documents_processed: int
    clauses_extracted: int
    obligations_generated: int
    pending_reviews: int
    evidence_gaps: int
    overdue_workflows: int
    audit_readiness_score: float


class RegulatoryDiffItem(BaseModel):
    change_type: str  # new, modified, removed, unchanged
    obligation_id: str
    description: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None


class ImpactRadar(BaseModel):
    circular_title: str
    clauses_added: int
    obligations_modified: int
    workflows_impacted: int
    evidence_requirements_changed: int
    review_required: bool


# Rebuild forward refs
DocumentDetail.model_rebuild()
ObligationDetail.model_rebuild()
