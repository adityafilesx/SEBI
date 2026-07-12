"""Audit API endpoints — events, gap detection, report generation."""

from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import AuditEvent, Obligation, Evidence, Workflow, Clause, RegulatoryDocument
from app.schemas.schemas import (
    AuditEventOut, GapOut, RemediationPlan,
    DashboardMetrics, ImpactRadar, RegulatoryDiffItem,
)

router = APIRouter(prefix="/api", tags=["audit"])


# ── Audit Events ──────────────────────────────────────────────

@router.get("/audit/events", response_model=list[AuditEventOut])
def list_audit_events(entity_type: str = None, entity_id: int = None, db: Session = Depends(get_db)):
    q = db.query(AuditEvent)
    if entity_type:
        q = q.filter(AuditEvent.entity_type == entity_type)
    if entity_id:
        q = q.filter(AuditEvent.entity_id == entity_id)
    events = q.order_by(AuditEvent.timestamp.desc()).all()
    return [AuditEventOut.model_validate(e) for e in events]


# ── Gap Detection (computed) ──────────────────────────────────

@router.get("/gaps", response_model=list[GapOut])
def detect_gaps(db: Session = Depends(get_db)):
    gaps = []
    obligations = db.query(Obligation).all()
    gap_counter = 1

    for obl in obligations:
        # Gap: Missing evidence
        required = len(obl.required_evidence) if obl.required_evidence else 0
        uploaded = db.query(Evidence).filter(
            Evidence.obligation_id == obl.id,
            Evidence.validation_status.in_(["Accepted", "Needs Review", "Pending"]),
        ).count()
        if required > 0 and uploaded < required and obl.status in ("Approved", "Workflow Created"):
            gaps.append(GapOut(
                gap_id=f"GAP-{gap_counter:03d}",
                obligation_id=obl.obligation_id,
                obligation_text=obl.obligation_text[:100] + "...",
                gap_type="missing_evidence",
                severity="High" if (uploaded / required) < 0.5 else "Medium",
                reason=f"Only {uploaded}/{required} evidence items uploaded ({round(uploaded/required*100)}%)",
                suggested_remediation=f"Upload remaining {required - uploaded} evidence items: {', '.join(obl.required_evidence[uploaded:])}",
                owner=obl.owner_role,
                due_date=date.today(),
            ))
            gap_counter += 1

        # Gap: No owner
        if not obl.owner_role and obl.status not in ("Rejected",):
            gaps.append(GapOut(
                gap_id=f"GAP-{gap_counter:03d}",
                obligation_id=obl.obligation_id,
                obligation_text=obl.obligation_text[:100] + "...",
                gap_type="no_owner",
                severity="Critical",
                reason="Obligation has no assigned owner or department",
                suggested_remediation="Assign Compliance Officer or Technology Operations Head as owner",
                owner=None,
                due_date=date.today(),
            ))
            gap_counter += 1

        # Gap: Low confidence
        if obl.confidence_score < 0.85 and obl.status not in ("Rejected",):
            gaps.append(GapOut(
                gap_id=f"GAP-{gap_counter:03d}",
                obligation_id=obl.obligation_id,
                obligation_text=obl.obligation_text[:100] + "...",
                gap_type="low_confidence",
                severity="Medium",
                reason=f"AI extraction confidence is {obl.confidence_score:.0%} (below 85% threshold)",
                suggested_remediation="Send for manual legal review to validate extraction accuracy",
                owner=obl.owner_role,
            ))
            gap_counter += 1

        # Gap: Needs review (stale AI Draft)
        if obl.status == "AI Draft":
            gaps.append(GapOut(
                gap_id=f"GAP-{gap_counter:03d}",
                obligation_id=obl.obligation_id,
                obligation_text=obl.obligation_text[:100] + "...",
                gap_type="needs_review",
                severity="Medium",
                reason="AI-generated obligation has not been reviewed by compliance officer",
                suggested_remediation="Route to compliance officer review queue immediately",
                owner=obl.owner_role,
            ))
            gap_counter += 1

    # Gap: Overdue workflows
    overdue_wfs = db.query(Workflow).filter(
        Workflow.due_date < date.today(),
        Workflow.status.notin_(["Completed"]),
    ).all()
    for wf in overdue_wfs:
        obl = db.query(Obligation).filter(Obligation.id == wf.obligation_id).first()
        if obl:
            gaps.append(GapOut(
                gap_id=f"GAP-{gap_counter:03d}",
                obligation_id=obl.obligation_id,
                obligation_text=f"Workflow '{wf.title}' is overdue",
                gap_type="overdue_workflow",
                severity="Critical",
                reason=f"Due date was {wf.due_date}, current status: {wf.status} ({wf.completion_percentage}% complete)",
                suggested_remediation="Escalate to management. Assign additional resources. Extend deadline with justification.",
                owner=wf.owner,
                due_date=wf.due_date,
            ))
            gap_counter += 1

    return gaps


@router.post("/gaps/remediation", response_model=RemediationPlan)
def generate_remediation(gap_id: str = "GAP-001"):
    return RemediationPlan(
        gap_id=gap_id,
        steps=[
            {"step": 1, "action": "Assign owner", "details": "Assign Compliance Officer or Tech Ops Head as responsible owner", "deadline": "Immediate"},
            {"step": 2, "action": "Request evidence", "details": "Send evidence collection request to relevant department", "deadline": "3 business days"},
            {"step": 3, "action": "Escalate if overdue", "details": "If not resolved within deadline, escalate to Chief Compliance Officer", "deadline": "5 business days"},
            {"step": 4, "action": "Schedule review", "details": "Add to next compliance committee meeting agenda", "deadline": "Next scheduled meeting"},
            {"step": 5, "action": "Generate audit note", "details": "Document gap, remediation steps, and timeline in audit trail", "deadline": "Immediate"},
        ],
    )


# ── Dashboard Metrics ─────────────────────────────────────────

@router.get("/dashboard/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    docs = db.query(RegulatoryDocument).filter(RegulatoryDocument.status.in_(["Analyzed", "Reviewed"])).count()
    clauses = db.query(Clause).count()
    obligations = db.query(Obligation).count()
    pending = db.query(Obligation).filter(Obligation.status.in_(["Needs Review", "AI Draft"])).count()

    # Evidence gaps
    evidence_gaps = 0
    for obl in db.query(Obligation).filter(Obligation.status.in_(["Approved", "Workflow Created"])).all():
        required = len(obl.required_evidence) if obl.required_evidence else 0
        uploaded = db.query(Evidence).filter(Evidence.obligation_id == obl.id).count()
        if uploaded < required:
            evidence_gaps += 1

    overdue = db.query(Workflow).filter(
        Workflow.due_date < date.today(),
        Workflow.status.notin_(["Completed"]),
    ).count()

    # Audit readiness: % of obligations that are approved/workflow-created with >50% evidence
    total_approved = db.query(Obligation).filter(
        Obligation.status.in_(["Approved", "Workflow Created"])
    ).count()
    ready = 0
    for obl in db.query(Obligation).filter(Obligation.status.in_(["Approved", "Workflow Created"])).all():
        required = len(obl.required_evidence) if obl.required_evidence else 0
        uploaded = db.query(Evidence).filter(Evidence.obligation_id == obl.id).count()
        if required == 0 or uploaded / required >= 0.5:
            ready += 1
    readiness = round((ready / total_approved * 100) if total_approved > 0 else 0, 1)

    return DashboardMetrics(
        documents_processed=docs,
        clauses_extracted=clauses,
        obligations_generated=obligations,
        pending_reviews=pending,
        evidence_gaps=evidence_gaps,
        overdue_workflows=overdue,
        audit_readiness_score=readiness,
    )


# ── Impact Radar ──────────────────────────────────────────────

@router.get("/dashboard/impact-radar", response_model=ImpactRadar)
def get_impact_radar():
    return ImpactRadar(
        circular_title="Framework for Handling Technical Glitches (Jan 2026)",
        clauses_added=3,
        obligations_modified=2,
        workflows_impacted=1,
        evidence_requirements_changed=4,
        review_required=True,
    )


# ── Regulatory Diff ──────────────────────────────────────────

@router.get("/audit/regulatory-diff", response_model=list[RegulatoryDiffItem])
def get_regulatory_diff():
    return [
        RegulatoryDiffItem(
            change_type="modified",
            obligation_id="OBL-TG-001",
            description="Notification deadline extended from 1 hour to 2 hours",
            old_value="Notify exchange within 1 hour",
            new_value="Notify exchange within 2 hours",
        ),
        RegulatoryDiffItem(
            change_type="modified",
            obligation_id="OBL-TG-003",
            description="RCA submission deadline extended from 7 to 14 working days",
            old_value="Submit RCA within 7 working days",
            new_value="Submit RCA within 14 working days",
        ),
        RegulatoryDiffItem(
            change_type="new",
            obligation_id="OBL-TG-004",
            description="New requirement to use centralized Samuhik Prativedan Manch portal",
            old_value=None,
            new_value="Submit all reports through Samuhik Prativedan Manch portal",
        ),
        RegulatoryDiffItem(
            change_type="new",
            obligation_id="OBL-TG-008",
            description="New applicability threshold: >10,000 registered clients",
            old_value=None,
            new_value="Applicable to brokers with >10,000 registered clients",
        ),
        RegulatoryDiffItem(
            change_type="modified",
            obligation_id="OBL-TG-006",
            description="DR drill frequency rationalized based on broker size",
            old_value="DR drills quarterly for all brokers",
            new_value="DR drills every 6 months, requirements based on size and technology dependency",
        ),
        RegulatoryDiffItem(
            change_type="unchanged",
            obligation_id="OBL-TG-005",
            description="Corrective action plan requirement within 30 days",
            old_value="Corrective action plan within 30 days",
            new_value="Corrective action plan within 30 days",
        ),
        RegulatoryDiffItem(
            change_type="removed",
            obligation_id="OBL-MC-003-OLD",
            description="Separate exchange-wise reporting requirement removed (consolidated into centralized portal)",
            old_value="Submit separate reports to each exchange",
            new_value=None,
        ),
    ]


# ── Audit Report Generation ──────────────────────────────────

@router.post("/audit/generate-report")
def generate_audit_report(db: Session = Depends(get_db)):
    """Generate a comprehensive audit report."""
    obligations = db.query(Obligation).all()
    documents = db.query(RegulatoryDocument).all()
    workflows = db.query(Workflow).all()
    evidence = db.query(Evidence).all()
    events = db.query(AuditEvent).order_by(AuditEvent.timestamp).all()

    approved = [o for o in obligations if o.status in ("Approved", "Workflow Created")]
    pending = [o for o in obligations if o.status in ("Needs Review", "AI Draft")]
    legal = [o for o in obligations if o.status == "Legal Review"]

    traceability = []
    for obl in obligations:
        clause = db.query(Clause).filter(Clause.id == obl.clause_id).first()
        doc = db.query(RegulatoryDocument).filter(RegulatoryDocument.id == clause.document_id).first() if clause else None
        ev_count = db.query(Evidence).filter(Evidence.obligation_id == obl.id).count()
        required = len(obl.required_evidence) if obl.required_evidence else 0

        traceability.append({
            "source_document": doc.title if doc else "Unknown",
            "clause": clause.clause_number if clause else "Unknown",
            "obligation_id": obl.obligation_id,
            "obligation": obl.obligation_text[:80] + "...",
            "owner": obl.owner_role or "Unassigned",
            "evidence": f"{ev_count}/{required}",
            "status": obl.status,
            "reviewer": obl.reviewed_by or "Pending",
            "confidence": f"{obl.confidence_score:.0%}",
            "clause_trust": obl.clause_trust_score,
        })

    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "executive_summary": {
            "total_documents": len(documents),
            "total_obligations": len(obligations),
            "approved": len(approved),
            "pending_review": len(pending),
            "legal_review": len(legal),
            "average_confidence": round(sum(o.confidence_score for o in obligations) / len(obligations), 2) if obligations else 0,
            "audit_readiness": f"{len(approved)}/{len(obligations)} obligations approved",
        },
        "regulatory_corpus": [
            {"title": d.title, "circular_number": d.circular_number, "date": d.issue_date.isoformat() if d.issue_date else None, "status": d.status}
            for d in documents
        ],
        "obligations_summary": {
            "total": len(obligations),
            "by_status": {
                "Approved": len([o for o in obligations if o.status == "Approved"]),
                "Workflow Created": len([o for o in obligations if o.status == "Workflow Created"]),
                "Needs Review": len([o for o in obligations if o.status == "Needs Review"]),
                "AI Draft": len([o for o in obligations if o.status == "AI Draft"]),
                "Rejected": len([o for o in obligations if o.status == "Rejected"]),
                "Legal Review": len([o for o in obligations if o.status == "Legal Review"]),
            },
            "by_risk": {
                "Critical": len([o for o in obligations if o.risk_level == "Critical"]),
                "High": len([o for o in obligations if o.risk_level == "High"]),
                "Medium": len([o for o in obligations if o.risk_level == "Medium"]),
                "Low": len([o for o in obligations if o.risk_level == "Low"]),
            },
        },
        "evidence_completeness": {
            "total_evidence_items": len(evidence),
            "accepted": len([e for e in evidence if e.validation_status == "Accepted"]),
            "needs_review": len([e for e in evidence if e.validation_status == "Needs Review"]),
            "pending": len([e for e in evidence if e.validation_status == "Pending"]),
        },
        "traceability_table": traceability,
        "ai_confidence_summary": {
            "average": round(sum(o.confidence_score for o in obligations) / len(obligations), 2) if obligations else 0,
            "above_85": len([o for o in obligations if o.confidence_score >= 0.85]),
            "below_85": len([o for o in obligations if o.confidence_score < 0.85]),
            "all_grounded": all(o.grounded for o in obligations),
        },
        "audit_event_count": len(events),
    }

    return report
