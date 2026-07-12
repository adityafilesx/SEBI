"""Evidence API endpoints."""

import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Evidence, AuditEvent
from app.schemas.schemas import EvidenceOut
from app.core.config import EVIDENCE_DIR

router = APIRouter(prefix="/api/evidence", tags=["evidence"])


@router.get("", response_model=list[EvidenceOut])
def list_evidence(db: Session = Depends(get_db)):
    items = db.query(Evidence).order_by(Evidence.uploaded_at.desc()).all()
    return [EvidenceOut.model_validate(e) for e in items]


@router.post("/upload", response_model=EvidenceOut)
async def upload_evidence(
    file: UploadFile = File(...),
    obligation_id: int = Form(...),
    evidence_type: str = Form(...),
    uploaded_by: str = Form(default="User"),
    db: Session = Depends(get_db),
):
    file_path = EVIDENCE_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    ev_count = db.query(Evidence).count()
    ev = Evidence(
        evidence_id=f"EV-{ev_count + 1:03d}",
        obligation_id=obligation_id,
        file_name=file.filename,
        evidence_type=evidence_type,
        validation_status="Pending",
        uploaded_by=uploaded_by,
        uploaded_at=datetime.utcnow(),
    )
    db.add(ev)
    db.add(AuditEvent(
        entity_type="evidence", entity_id=ev_count + 1,
        action="Evidence uploaded", actor=uploaded_by,
        timestamp=datetime.utcnow(),
        details={"file": file.filename, "obligation_id": obligation_id},
    ))
    db.commit()
    db.refresh(ev)
    return EvidenceOut.model_validate(ev)
