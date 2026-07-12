"""Document API endpoints."""

import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import RegulatoryDocument, Clause, Obligation, AuditEvent
from app.schemas.schemas import DocumentOut, DocumentDetail, ClauseOut
from app.core.config import UPLOAD_DIR
from app.services.compliance_compiler import ComplianceCompilerService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(RegulatoryDocument).order_by(RegulatoryDocument.created_at.desc()).all()
    results = []
    for doc in docs:
        clause_count = db.query(Clause).filter(Clause.document_id == doc.id).count()
        obl_count = (
            db.query(Obligation)
            .join(Clause)
            .filter(Clause.document_id == doc.id)
            .count()
        )
        d = DocumentOut.model_validate(doc)
        d.clause_count = clause_count
        d.obligation_count = obl_count
        results.append(d)
    return results


@router.get("/{doc_id}", response_model=DocumentDetail)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(RegulatoryDocument).filter(RegulatoryDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    clauses = db.query(Clause).filter(Clause.document_id == doc_id).order_by(Clause.clause_number).all()
    clause_outs = []
    for c in clauses:
        co = ClauseOut.model_validate(c)
        co.obligation_count = db.query(Obligation).filter(Obligation.clause_id == c.id).count()
        clause_outs.append(co)

    result = DocumentDetail.model_validate(doc)
    result.clauses = clause_outs
    result.clause_count = len(clauses)
    result.obligation_count = sum(c.obligation_count for c in clause_outs)
    return result


@router.post("/upload", response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Save file
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Create document record
    doc = RegulatoryDocument(
        title=file.filename.replace(".pdf", "").replace("_", " ").title(),
        document_type="Circular",
        source="SEBI",
        intermediary="Stock Broker",
        status="Uploaded",
        file_path=str(file_path),
        created_at=datetime.utcnow(),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Audit event
    db.add(AuditEvent(
        entity_type="document", entity_id=doc.id,
        action="Document uploaded", actor="User",
        timestamp=datetime.utcnow(),
        details={"filename": file.filename},
    ))
    db.commit()

    return DocumentOut.model_validate(doc)


@router.post("/{doc_id}/analyze", response_model=DocumentDetail)
def analyze_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(RegulatoryDocument).filter(RegulatoryDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    compiler = ComplianceCompilerService(db)
    compiler.process_document(doc)

    return get_document(doc_id, db)


@router.get("/{doc_id}/clauses", response_model=list[ClauseOut])
def list_clauses(doc_id: int, db: Session = Depends(get_db)):
    clauses = db.query(Clause).filter(Clause.document_id == doc_id).order_by(Clause.clause_number).all()
    results = []
    for c in clauses:
        co = ClauseOut.model_validate(c)
        co.obligation_count = db.query(Obligation).filter(Obligation.clause_id == c.id).count()
        results.append(co)
    return results
