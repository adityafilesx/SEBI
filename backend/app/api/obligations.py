"""Obligation API endpoints."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Obligation, Clause, Evidence, AuditEvent, Workflow
from app.schemas.schemas import ObligationOut, ObligationDetail, ObligationUpdate, ClauseOut, EvidenceOut, AuditEventOut

router = APIRouter(prefix="/api/obligations", tags=["obligations"])


def _enrich_obligation(obl: Obligation, db: Session) -> ObligationOut:
    """Add computed evidence fields to obligation."""
    out = ObligationOut.model_validate(obl)
    required = len(obl.required_evidence) if obl.required_evidence else 0
    uploaded = db.query(Evidence).filter(
        Evidence.obligation_id == obl.id,
        Evidence.validation_status.in_(["Accepted", "Needs Review", "Pending"]),
    ).count()
    out.evidence_required = required
    out.evidence_uploaded = uploaded
    out.evidence_completeness = round((uploaded / required * 100) if required > 0 else 0, 1)
    return out


@router.get("", response_model=list[ObligationOut])
def list_obligations(
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    trigger_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Obligation)
    if status:
        q = q.filter(Obligation.status == status)
    if risk_level:
        q = q.filter(Obligation.risk_level == risk_level)
    if trigger_type:
        q = q.filter(Obligation.trigger_type == trigger_type)
    obligations = q.order_by(Obligation.created_at.desc()).all()
    return [_enrich_obligation(o, db) for o in obligations]


@router.get("/{obl_id}", response_model=ObligationDetail)
def get_obligation(obl_id: int, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obl_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found")

    out = ObligationDetail(**_enrich_obligation(obl, db).model_dump())

    # Clause
    clause = db.query(Clause).filter(Clause.id == obl.clause_id).first()
    if clause:
        out.clause = ClauseOut.model_validate(clause)

    # Evidence
    evidence = db.query(Evidence).filter(Evidence.obligation_id == obl.id).all()
    out.evidence_items = [EvidenceOut.model_validate(e) for e in evidence]

    # Audit trail
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.entity_type == "obligation", AuditEvent.entity_id == obl.id)
        .order_by(AuditEvent.timestamp)
        .all()
    )
    out.audit_trail = [AuditEventOut.model_validate(e) for e in events]

    return out


@router.post("/{obl_id}/approve", response_model=ObligationOut)
def approve_obligation(obl_id: int, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obl_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found")

    obl.status = "Approved"
    obl.reviewed_at = datetime.utcnow()
    obl.reviewed_by = "Priya Sharma"

    db.add(AuditEvent(
        entity_type="obligation", entity_id=obl.id,
        action="Approved by compliance officer",
        actor="Priya Sharma", timestamp=datetime.utcnow(),
        details={"status": "Approved"},
    ))
    db.commit()
    db.refresh(obl)
    return _enrich_obligation(obl, db)


@router.post("/{obl_id}/reject", response_model=ObligationOut)
def reject_obligation(obl_id: int, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obl_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found")

    obl.status = "Rejected"
    obl.reviewed_at = datetime.utcnow()
    obl.reviewed_by = "Priya Sharma"

    db.add(AuditEvent(
        entity_type="obligation", entity_id=obl.id,
        action="Rejected by compliance officer",
        actor="Priya Sharma", timestamp=datetime.utcnow(),
        details={"status": "Rejected"},
    ))
    db.commit()
    db.refresh(obl)
    return _enrich_obligation(obl, db)


@router.post("/{obl_id}/legal-review", response_model=ObligationOut)
def send_for_legal_review(obl_id: int, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obl_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found")

    obl.status = "Legal Review"

    db.add(AuditEvent(
        entity_type="obligation", entity_id=obl.id,
        action="Sent for legal review",
        actor="Priya Sharma", timestamp=datetime.utcnow(),
        details={"status": "Legal Review"},
    ))
    db.commit()
    db.refresh(obl)
    return _enrich_obligation(obl, db)


@router.put("/{obl_id}", response_model=ObligationOut)
def update_obligation(obl_id: int, update: ObligationUpdate, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obl_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(obl, field, value)

    db.add(AuditEvent(
        entity_type="obligation", entity_id=obl.id,
        action="Obligation updated",
        actor="Priya Sharma", timestamp=datetime.utcnow(),
        details=update.model_dump(exclude_unset=True),
    ))
    db.commit()
    db.refresh(obl)
    return _enrich_obligation(obl, db)
