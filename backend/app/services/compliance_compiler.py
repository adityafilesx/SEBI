"""Compliance Compiler Service — 10-stage pipeline.

Deterministic demo-safe AI pipeline with real PDF extraction.
The pipeline includes rule-based and seeded extraction for repeatable demos,
with optional LLM adapters for OpenAI, Gemini or Claude.
"""

import re
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.models import RegulatoryDocument, Clause, Obligation, AuditEvent
from app.services.pdf_extractor import extract_pdf_text
from app.services.clause_segmenter import segment_clauses


class ComplianceCompilerService:
    """10-stage compliance compiler pipeline."""

    def __init__(self, db: Session):
        self.db = db

    def process_document(self, doc: RegulatoryDocument):
        """Run full pipeline on a regulatory document."""
        # Stage 1: Document ingestion
        raw_text = self._ingest_document(doc)

        # Stage 2: Clause segmentation
        clause_chunks = segment_clauses(raw_text)

        # Stage 3-4: Applicability classification + Obligation extraction
        clauses_created = self._create_clauses(doc, clause_chunks)

        # Stage 5-8: Generate obligations with scoring
        self._generate_obligations(doc, clauses_created)

        # Update document status
        doc.status = "Analyzed"
        doc.raw_text = raw_text
        self.db.commit()

        # Stage 9: Audit trail
        self.db.add(AuditEvent(
            entity_type="document", entity_id=doc.id,
            action="AI extraction completed",
            actor="RegPilot AI", timestamp=datetime.utcnow(),
            details={"clauses": len(clauses_created), "pipeline": "ComplianceCompiler v1.0"},
        ))
        self.db.commit()

    def _ingest_document(self, doc: RegulatoryDocument) -> str:
        """Stage 1: Extract text from document."""
        if doc.raw_text:
            return doc.raw_text

        if doc.file_path:
            text, metadata = extract_pdf_text(doc.file_path)
            doc.page_count = metadata.get("page_count", 0)
            if metadata.get("title"):
                doc.title = metadata["title"]
            return text

        return ""

    def _create_clauses(self, doc: RegulatoryDocument, chunks: list[dict]) -> list[Clause]:
        """Stage 2-3: Create clause records from segmented chunks."""
        clauses = []
        for chunk in chunks:
            clause = Clause(
                document_id=doc.id,
                clause_number=chunk["clause_number"],
                heading=chunk.get("heading", ""),
                text=chunk["text"],
                source_text=chunk["text"],  # Real extracted text
                page_number=chunk.get("page_number"),
                risk_tags=self._classify_risk_tags(chunk["text"]),
                created_at=datetime.utcnow(),
            )
            self.db.add(clause)
            clauses.append(clause)

        self.db.commit()
        for c in clauses:
            self.db.refresh(c)

        self.db.add(AuditEvent(
            entity_type="document", entity_id=doc.id,
            action="Clauses extracted",
            actor="RegPilot AI", timestamp=datetime.utcnow(),
            details={"clause_count": len(clauses)},
        ))
        return clauses

    def _generate_obligations(self, doc: RegulatoryDocument, clauses: list[Clause]):
        """Stage 4-8: Extract obligations, score, and check guardrails."""
        obl_counter = self.db.query(Obligation).count()

        for clause in clauses:
            # Only generate obligations for actionable clauses
            if not self._is_actionable(clause.text):
                continue

            obl_counter += 1
            obligation_text = self._extract_obligation_text(clause)
            obl_type = self._classify_obligation_type(clause.text)
            trigger = self._extract_trigger_type(clause.text)
            evidence = self._map_evidence_requirements(clause.text)
            confidence = self._calculate_confidence(clause)
            risk = self._assess_risk_level(clause.text)

            # ClauseTrust scoring (Novelty 2)
            trust_score = self._calculate_clause_trust(
                has_citation=True,
                fields_complete=bool(obligation_text and obl_type and trigger),
                confidence=confidence,
                reviewed=False,  # New, not yet reviewed
                evidence_mapped=len(evidence) > 0,
            )

            obl = Obligation(
                obligation_id=f"OBL-EXT-{obl_counter:03d}",
                clause_id=clause.id,
                obligation_text=obligation_text,
                obligation_type=obl_type,
                trigger_type=trigger,
                intermediary="Stock Broker",
                owner_role=self._suggest_owner(clause.text),
                department=self._suggest_department(clause.text),
                deadline_rule=self._extract_deadline(clause.text),
                required_evidence=evidence,
                risk_level=risk,
                confidence_score=confidence,
                clause_trust_score=trust_score,
                status="Needs Review",
                human_review_required=True,
                grounded=True,
                source_citation=f"Clause {clause.clause_number} — {doc.title}, {doc.circular_number or ''}",
                created_at=datetime.utcnow(),
            )
            self.db.add(obl)

            # Audit event for each obligation
            self.db.add(AuditEvent(
                entity_type="obligation", entity_id=obl_counter,
                action="Obligation generated by AI",
                actor="RegPilot AI", timestamp=datetime.utcnow(),
                details={"obligation_id": obl.obligation_id, "confidence": confidence},
            ))

        self.db.commit()

    # ── Helper methods ────────────────────────────────────────

    def _classify_risk_tags(self, text: str) -> list[str]:
        tags = []
        patterns = {
            "Technical Glitch": r"technical\s+glitch|system\s+malfunction|trading\s+disruption",
            "Incident Reporting": r"report|notify|notification|incident",
            "Root Cause Analysis": r"root\s+cause|RCA",
            "Exchange Submission": r"exchange|submission|portal",
            "Corrective Action": r"corrective\s+action|remediation",
            "Disaster Recovery": r"disaster\s+recovery|DR\s+drill|business\s+continuity",
            "Cybersecurity": r"cyber|security|data\s+protection",
            "Governance": r"board|management|CEO|MD|accountability",
            "Penalty": r"penalty|disincentive|fine",
        }
        for tag, pattern in patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                tags.append(tag)
        return tags or ["General"]

    def _is_actionable(self, text: str) -> bool:
        action_words = r"\b(shall|must|required|ensure|maintain|submit|notify|conduct|prepare|implement)\b"
        return bool(re.search(action_words, text, re.IGNORECASE))

    def _extract_obligation_text(self, clause: Clause) -> str:
        text = clause.text.strip()
        if len(text) > 200:
            # Truncate and clean up
            text = text[:200].rsplit(" ", 1)[0] + "..."
        return f"Stock broker must: {text}" if not text.lower().startswith("stock broker") else text

    def _classify_obligation_type(self, text: str) -> str:
        if re.search(r"report|submit|notify|disclose", text, re.IGNORECASE):
            return "Reporting"
        elif re.search(r"document|maintain|record|prepare", text, re.IGNORECASE):
            return "Documentation"
        elif re.search(r"board|management|CEO|governance|accountab", text, re.IGNORECASE):
            return "Governance"
        return "Operational"

    def _extract_trigger_type(self, text: str) -> str:
        if re.search(r"upon|when|if|incident|occurrence|detection", text, re.IGNORECASE):
            return "Event-triggered"
        elif re.search(r"annual|quarterly|monthly|periodic|every\s+\d+\s+months", text, re.IGNORECASE):
            return "Recurring"
        elif re.search(r"one-time|initial|by\s+\w+\s+\d{4}", text, re.IGNORECASE):
            return "One-time"
        return "Reporting"

    def _map_evidence_requirements(self, text: str) -> list[str]:
        evidence = []
        mappings = {
            "Incident ticket": r"incident|glitch|malfunction",
            "Technical glitch report": r"technical\s+glitch|report",
            "Exchange submission acknowledgement": r"exchange|submission|portal",
            "RCA document": r"root\s+cause|RCA",
            "Corrective action plan": r"corrective\s+action",
            "System log": r"system\s+log|log\s+extract",
            "Management approval": r"management|board|approval|sign-off",
            "Audit report": r"audit|system\s+audit",
            "DR drill report": r"disaster\s+recovery|DR\s+drill",
        }
        for evidence_type, pattern in mappings.items():
            if re.search(pattern, text, re.IGNORECASE):
                evidence.append(evidence_type)
        return evidence or ["Supporting documentation"]

    def _calculate_confidence(self, clause: Clause) -> float:
        base = 0.75
        if clause.source_text:
            base += 0.10
        if clause.heading:
            base += 0.05
        if len(clause.text) > 50:
            base += 0.05
        return min(round(base, 2), 0.98)

    def _assess_risk_level(self, text: str) -> str:
        if re.search(r"penalty|disincentive|critical|immediate|violation", text, re.IGNORECASE):
            return "Critical"
        elif re.search(r"within\s+\d+\s+(hour|day)|must|mandatory", text, re.IGNORECASE):
            return "High"
        elif re.search(r"shall|required|ensure", text, re.IGNORECASE):
            return "Medium"
        return "Low"

    def _suggest_owner(self, text: str) -> str:
        if re.search(r"compliance|regulatory", text, re.IGNORECASE):
            return "Compliance Officer"
        elif re.search(r"technology|system|IT|infrastructure|DR", text, re.IGNORECASE):
            return "Technology Operations Head"
        elif re.search(r"legal|counsel", text, re.IGNORECASE):
            return "Legal Counsel"
        elif re.search(r"board|CEO|MD|management", text, re.IGNORECASE):
            return "Chief Compliance Officer"
        return "Compliance Officer"

    def _suggest_department(self, text: str) -> str:
        if re.search(r"technology|system|IT", text, re.IGNORECASE):
            return "Technology Operations"
        elif re.search(r"board|management", text, re.IGNORECASE):
            return "Compliance + Board"
        return "Compliance"

    def _extract_deadline(self, text: str) -> str:
        patterns = [
            (r"within\s+(\d+\s+(?:hour|hours))", "Within {}"),
            (r"within\s+(\d+\s+(?:working\s+)?days?)", "Within {}"),
            (r"by\s+the\s+next\s+trading\s+day", "T+1 (next trading day)"),
            (r"(quarterly|annual|monthly)", "{}"),
            (r"every\s+(\d+\s+months?)", "Every {}"),
        ]
        for pattern, template in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return template.format(match.group(1) if match.lastindex else match.group(0))
        return "As per circular timeline"

    @staticmethod
    def _calculate_clause_trust(
        has_citation: bool,
        fields_complete: bool,
        confidence: float,
        reviewed: bool,
        evidence_mapped: bool,
    ) -> int:
        """Calculate ClauseTrust Score (0-100).

        Factors:
        1. Source grounding (citation present): +30
        2. Schema completeness (required fields): +25
        3. Extraction confidence (>0.85): +20
        4. Human validation (reviewed): +15
        5. Evidence readiness (mapped): +10
        """
        score = 0
        if has_citation:
            score += 30
        if fields_complete:
            score += 25
        if confidence >= 0.85:
            score += 20
        if reviewed:
            score += 15
        if evidence_mapped:
            score += 10
        return score
