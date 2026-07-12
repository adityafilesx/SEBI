"""Workflow API endpoints."""

from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Workflow, Obligation, AuditEvent
from app.schemas.schemas import WorkflowOut

router = APIRouter(prefix="/api/workflows", tags=["workflows"])

# Workflow step templates for technical-glitch obligations
WORKFLOW_TEMPLATES = {
    "Reporting": [
        {"step": 1, "title": "Detect and classify incident", "status": "Pending"},
        {"step": 2, "title": "Prepare notification content", "status": "Pending"},
        {"step": 3, "title": "Submit to exchange/portal", "status": "Pending"},
        {"step": 4, "title": "Notify affected clients", "status": "Pending"},
        {"step": 5, "title": "Collect acknowledgement evidence", "status": "Pending"},
    ],
    "Documentation": [
        {"step": 1, "title": "Gather relevant data and logs", "status": "Pending"},
        {"step": 2, "title": "Draft document", "status": "Pending"},
        {"step": 3, "title": "Internal review", "status": "Pending"},
        {"step": 4, "title": "Management sign-off", "status": "Pending"},
        {"step": 5, "title": "Submit to exchange", "status": "Pending"},
        {"step": 6, "title": "Archive evidence", "status": "Pending"},
    ],
    "Operational": [
        {"step": 1, "title": "Identify action items", "status": "Pending"},
        {"step": 2, "title": "Assign responsibilities", "status": "Pending"},
        {"step": 3, "title": "Execute action plan", "status": "Pending"},
        {"step": 4, "title": "Verify completion", "status": "Pending"},
        {"step": 5, "title": "Document evidence", "status": "Pending"},
    ],
    "Governance": [
        {"step": 1, "title": "Compile compliance data", "status": "Pending"},
        {"step": 2, "title": "Prepare report/presentation", "status": "Pending"},
        {"step": 3, "title": "Get inputs from stakeholders", "status": "Pending"},
        {"step": 4, "title": "Present to Board/Management", "status": "Pending"},
        {"step": 5, "title": "Record minutes and actions", "status": "Pending"},
    ],
}


def _enrich_workflow(wf: Workflow, db: Session) -> WorkflowOut:
    out = WorkflowOut.model_validate(wf)
    obl = db.query(Obligation).filter(Obligation.id == wf.obligation_id).first()
    out.linked_obligation_id = obl.obligation_id if obl else ""
    return out


@router.get("", response_model=list[WorkflowOut])
def list_workflows(db: Session = Depends(get_db)):
    workflows = db.query(Workflow).order_by(Workflow.created_at.desc()).all()
    return [_enrich_workflow(wf, db) for wf in workflows]


@router.post("/generate/{obligation_id}", response_model=WorkflowOut)
def generate_workflow(obligation_id: int, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obligation_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found")
    if obl.status not in ("Approved", "Workflow Created"):
        raise HTTPException(status_code=400, detail="Obligation must be approved before workflow generation")

    # Check if workflow already exists
    existing = db.query(Workflow).filter(Workflow.obligation_id == obligation_id).first()
    if existing:
        return _enrich_workflow(existing, db)

    # Generate workflow from template
    wf_count = db.query(Workflow).count()
    steps = WORKFLOW_TEMPLATES.get(obl.obligation_type, WORKFLOW_TEMPLATES["Operational"])

    wf = Workflow(
        workflow_id=f"WF-GEN-{wf_count + 1:03d}",
        obligation_id=obligation_id,
        title=f"Workflow: {obl.obligation_text[:80]}...",
        owner=obl.owner_role or "Unassigned",
        department=obl.department or "Unassigned",
        due_date=date.today() + timedelta(days=14),
        status="Pending",
        escalation_level=0,
        completion_percentage=0,
        steps=steps,
        created_at=datetime.utcnow(),
    )
    db.add(wf)

    obl.status = "Workflow Created"
    db.add(AuditEvent(
        entity_type="obligation", entity_id=obl.id,
        action="Workflow created", actor="RegPilot AI",
        timestamp=datetime.utcnow(),
        details={"workflow_id": wf.workflow_id},
    ))

    db.commit()
    db.refresh(wf)
    return _enrich_workflow(wf, db)


@router.put("/{wf_id}/status", response_model=WorkflowOut)
def update_workflow_status(wf_id: int, status: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == wf_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    wf.status = status
    db.commit()
    db.refresh(wf)
    return _enrich_workflow(wf, db)
