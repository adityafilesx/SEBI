"""Seed data for RegPilot AI.

Comprehensive demo data based on SEBI stockbroker technical-glitch compliance.
Uses the Jan 2026 revised framework as the primary scenario.
"""

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session

from app.models.models import (
    User, RegulatoryDocument, Clause, Obligation,
    Workflow, Evidence, AuditEvent,
)


def seed_database(db: Session):
    """Populate the database with realistic demo data."""

    # Check if already seeded
    if db.query(User).count() > 0:
        return

    # ── Users ──────────────────────────────────────────────────
    users = [
        User(id=1, name="Priya Sharma", role="Chief Compliance Officer", department="Compliance"),
        User(id=2, name="Rahul Mehta", role="Technology Operations Head", department="Technology Operations"),
        User(id=3, name="Anita Desai", role="Legal Counsel", department="Legal"),
        User(id=4, name="Vikram Singh", role="Risk Manager", department="Risk Management"),
        User(id=5, name="RegPilot AI", role="AI Extraction Engine", department="System"),
    ]
    db.add_all(users)

    # ── Regulatory Documents ──────────────────────────────────
    docs = [
        RegulatoryDocument(
            id=1,
            title="Framework for Handling Technical Glitches in Stock Brokers' Electronic Trading Systems",
            document_type="Circular",
            source="SEBI",
            circular_number="SEBI/HO/38/44/12(1)2026-MIRSD-TPD1",
            issue_date=date(2026, 1, 9),
            intermediary="Stock Broker",
            status="Analyzed",
            file_path="demo_docs/sebi_tech_glitch_2026.pdf",
            raw_text=TECH_GLITCH_CIRCULAR_TEXT,
            page_count=12,
            created_at=datetime(2026, 1, 10, 9, 0),
        ),
        RegulatoryDocument(
            id=2,
            title="Master Circular for Stock Brokers",
            document_type="Master Circular",
            source="SEBI",
            circular_number="SEBI/HO/MIRSD/MIRSD-SEC-2/P/CIR/2025/186",
            issue_date=date(2025, 12, 16),
            intermediary="Stock Broker",
            status="Analyzed",
            file_path="demo_docs/sebi_master_circular_brokers.pdf",
            raw_text=MASTER_CIRCULAR_EXCERPT,
            page_count=85,
            created_at=datetime(2025, 12, 20, 10, 0),
        ),
        RegulatoryDocument(
            id=3,
            title="Cybersecurity and Cyber Resilience Framework for Stock Brokers",
            document_type="Circular",
            source="SEBI",
            circular_number="SEBI/HO/MIRSD/TPD/P/CIR/2025/155",
            issue_date=date(2025, 10, 31),
            intermediary="Stock Broker",
            status="Uploaded",
            file_path=None,
            raw_text=None,
            page_count=0,
            created_at=datetime(2025, 11, 5, 14, 30),
        ),
    ]
    db.add_all(docs)

    # ── Clauses (Technical Glitch Circular) ────────────────────
    clauses_doc1 = [
        Clause(
            id=1, document_id=1, clause_number="1.1",
            heading="Applicability",
            text="This framework shall be applicable to stock brokers who provide electronic trading platforms (web-based or mobile applications) and have more than 10,000 registered clients as on March 31 of the previous financial year.",
            source_text="This framework shall be applicable to stock brokers who provide electronic trading platforms (web-based or mobile applications) and have more than 10,000 registered clients as on March 31 of the previous financial year.",
            page_number=2,
            risk_tags=["Applicability", "Technology Operations"],
        ),
        Clause(
            id=2, document_id=1, clause_number="2.1",
            heading="Definition of Technical Glitch",
            text="A 'Technical Glitch' means any hardware, software, or network malfunction in the stock broker's electronic trading system — related to trading or risk management — that disrupts trading activities (such as login, order placement, modification, cancellation, or viewing of funds and margins) for five minutes or more during trading hours.",
            source_text="A 'Technical Glitch' means any hardware, software, or network malfunction in the stock broker's electronic trading system — related to trading or risk management — that disrupts trading activities (such as login, order placement, modification, cancellation, or viewing of funds and margins) for five minutes or more during trading hours.",
            page_number=3,
            risk_tags=["Technical Glitch", "Definition"],
        ),
        Clause(
            id=3, document_id=1, clause_number="3.1",
            heading="Notification to Exchange and Clients",
            text="Upon detection of a technical glitch, the stock broker shall notify the concerned stock exchange(s) and affected clients within two hours of the occurrence. The notification shall include the nature of the glitch, estimated time of resolution, and impact assessment.",
            source_text="Upon detection of a technical glitch, the stock broker shall notify the concerned stock exchange(s) and affected clients within two hours of the occurrence. The notification shall include the nature of the glitch, estimated time of resolution, and impact assessment.",
            page_number=4,
            risk_tags=["Technical Glitch", "Incident Reporting", "Exchange Submission"],
        ),
        Clause(
            id=4, document_id=1, clause_number="3.2",
            heading="Preliminary Incident Report",
            text="A preliminary incident report shall be submitted to the exchange by the next trading day (T+1). The report shall contain details of the glitch including timestamp, systems affected, number of clients impacted, and immediate corrective steps taken.",
            source_text="A preliminary incident report shall be submitted to the exchange by the next trading day (T+1). The report shall contain details of the glitch including timestamp, systems affected, number of clients impacted, and immediate corrective steps taken.",
            page_number=4,
            risk_tags=["Technical Glitch", "Incident Reporting"],
        ),
        Clause(
            id=5, document_id=1, clause_number="3.3",
            heading="Root Cause Analysis",
            text="A detailed Root Cause Analysis (RCA) must be submitted within 14 working days of the incident. The RCA shall identify the root cause, impact analysis, corrective actions implemented, and preventive measures to avoid recurrence.",
            source_text="A detailed Root Cause Analysis (RCA) must be submitted within 14 working days of the incident. The RCA shall identify the root cause, impact analysis, corrective actions implemented, and preventive measures to avoid recurrence.",
            page_number=5,
            risk_tags=["Technical Glitch", "Root Cause Analysis"],
        ),
        Clause(
            id=6, document_id=1, clause_number="3.4",
            heading="Centralized Reporting Platform",
            text="All reports related to technical glitches shall be submitted through the centralized 'Samuhik Prativedan Manch' portal maintained by the stock exchanges.",
            source_text="All reports related to technical glitches shall be submitted through the centralized 'Samuhik Prativedan Manch' portal maintained by the stock exchanges.",
            page_number=5,
            risk_tags=["Technical Glitch", "Exchange Submission"],
        ),
        Clause(
            id=7, document_id=1, clause_number="4.1",
            heading="Corrective Action Plan",
            text="The stock broker shall prepare and implement a corrective action plan within 30 days of the incident. The plan shall be approved by the management and made available for inspection by SEBI or the stock exchange.",
            source_text="The stock broker shall prepare and implement a corrective action plan within 30 days of the incident. The plan shall be approved by the management and made available for inspection by SEBI or the stock exchange.",
            page_number=6,
            risk_tags=["Technical Glitch", "Corrective Action"],
        ),
        Clause(
            id=8, document_id=1, clause_number="5.1",
            heading="Disincentive Framework",
            text="Stock exchanges shall levy penalties on brokers based on the severity and frequency of technical glitches. Major glitches affecting more than 5% of active clients shall attract higher penalties.",
            source_text="Stock exchanges shall levy penalties on brokers based on the severity and frequency of technical glitches. Major glitches affecting more than 5% of active clients shall attract higher penalties.",
            page_number=7,
            risk_tags=["Technical Glitch", "Penalty", "Risk"],
        ),
        Clause(
            id=9, document_id=1, clause_number="6.1",
            heading="Capacity Planning and DR Requirements",
            text="Stock brokers shall maintain adequate system capacity with a minimum headroom of 1.5x peak load. Disaster recovery drills shall be conducted at least once every six months with documented results.",
            source_text="Stock brokers shall maintain adequate system capacity with a minimum headroom of 1.5x peak load. Disaster recovery drills shall be conducted at least once every six months with documented results.",
            page_number=8,
            risk_tags=["Technology Operations", "Disaster Recovery"],
        ),
        Clause(
            id=10, document_id=1, clause_number="7.1",
            heading="Management Accountability",
            text="The Managing Director or CEO, along with the Chief Technology Officer and the Compliance Officer, shall be jointly responsible for ensuring adherence to this framework. A quarterly compliance report shall be placed before the Board.",
            source_text="The Managing Director or CEO, along with the Chief Technology Officer and the Compliance Officer, shall be jointly responsible for ensuring adherence to this framework. A quarterly compliance report shall be placed before the Board.",
            page_number=9,
            risk_tags=["Governance", "Management Review"],
        ),
    ]
    db.add_all(clauses_doc1)

    # ── Clauses (Master Circular) ──────────────────────────────
    clauses_doc2 = [
        Clause(
            id=11, document_id=2, clause_number="7.6",
            heading="Technical Glitch Reporting (Legacy)",
            text="Stock brokers shall report all technical glitches to the exchange within one hour of occurrence. A root cause analysis shall be submitted within 7 working days.",
            source_text="Stock brokers shall report all technical glitches to the exchange within one hour of occurrence. A root cause analysis shall be submitted within 7 working days.",
            page_number=42,
            risk_tags=["Technical Glitch", "Incident Reporting"],
        ),
        Clause(
            id=12, document_id=2, clause_number="8.1",
            heading="System Audit Requirements",
            text="Every stock broker using algorithmic trading or providing Direct Market Access shall conduct a system audit at least once a year by a CERT-In empanelled auditor.",
            source_text="Every stock broker using algorithmic trading or providing Direct Market Access shall conduct a system audit at least once a year by a CERT-In empanelled auditor.",
            page_number=48,
            risk_tags=["Technology Operations", "System Audit"],
        ),
        Clause(
            id=13, document_id=2, clause_number="9.3",
            heading="Client Data Protection",
            text="Stock brokers shall implement adequate safeguards for protection of client data and ensure compliance with applicable data protection regulations. Access to client data shall be restricted on a need-to-know basis.",
            source_text="Stock brokers shall implement adequate safeguards for protection of client data and ensure compliance with applicable data protection regulations. Access to client data shall be restricted on a need-to-know basis.",
            page_number=55,
            risk_tags=["Cybersecurity", "Data Protection"],
        ),
    ]
    db.add_all(clauses_doc2)

    # ── Obligations ───────────────────────────────────────────
    today = date.today()
    obligations = [
        Obligation(
            id=1, obligation_id="OBL-TG-001", clause_id=3,
            obligation_text="Stock broker must notify the concerned stock exchange(s) and affected clients within two hours of detecting a technical glitch, including the nature, estimated resolution time, and impact assessment.",
            obligation_type="Reporting", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role="Compliance Officer",
            department="Compliance + Technology Operations",
            deadline_rule="Within 2 hours of glitch detection",
            required_evidence=["Incident ticket", "Exchange notification record", "Client notification log", "Impact assessment report", "System monitoring alert"],
            risk_level="Critical", confidence_score=0.94,
            clause_trust_score=92, status="Approved",
            human_review_required=True, grounded=True,
            source_citation="Clause 3.1 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 10, 30),
            reviewed_at=datetime(2026, 1, 13, 14, 0),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=2, obligation_id="OBL-TG-002", clause_id=4,
            obligation_text="Submit preliminary incident report to the exchange by the next trading day (T+1) containing timestamp, systems affected, number of impacted clients, and immediate corrective steps.",
            obligation_type="Reporting", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role="Technology Operations Head",
            department="Technology Operations",
            deadline_rule="T+1 (next trading day after incident)",
            required_evidence=["Preliminary incident report", "System log extracts", "Client impact count", "Exchange submission acknowledgement"],
            risk_level="High", confidence_score=0.91,
            clause_trust_score=88, status="Approved",
            human_review_required=True, grounded=True,
            source_citation="Clause 3.2 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 10, 35),
            reviewed_at=datetime(2026, 1, 13, 14, 15),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=3, obligation_id="OBL-TG-003", clause_id=5,
            obligation_text="Submit detailed Root Cause Analysis (RCA) within 14 working days of the incident, identifying root cause, impact analysis, corrective actions implemented, and preventive measures.",
            obligation_type="Documentation", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role="Technology Operations Head",
            department="Technology Operations + Compliance",
            deadline_rule="14 working days from incident date",
            required_evidence=["RCA document", "Impact analysis report", "Corrective action plan", "Preventive measures documentation", "Management sign-off"],
            risk_level="High", confidence_score=0.93,
            clause_trust_score=85, status="Workflow Created",
            human_review_required=True, grounded=True,
            source_citation="Clause 3.3 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 10, 40),
            reviewed_at=datetime(2026, 1, 14, 9, 30),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=4, obligation_id="OBL-TG-004", clause_id=6,
            obligation_text="Submit all technical glitch reports through the centralized 'Samuhik Prativedan Manch' portal maintained by stock exchanges.",
            obligation_type="Operational", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role="Compliance Officer",
            department="Compliance",
            deadline_rule="As per reporting timelines (2 hours / T+1 / 14 days)",
            required_evidence=["Portal submission confirmation", "Submission receipt/acknowledgement"],
            risk_level="Medium", confidence_score=0.89,
            clause_trust_score=80, status="Approved",
            human_review_required=True, grounded=True,
            source_citation="Clause 3.4 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 10, 45),
            reviewed_at=datetime(2026, 1, 14, 10, 0),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=5, obligation_id="OBL-TG-005", clause_id=7,
            obligation_text="Prepare and implement corrective action plan within 30 days of incident. Plan must be approved by management and available for SEBI/exchange inspection.",
            obligation_type="Operational", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role="Technology Operations Head",
            department="Technology Operations",
            deadline_rule="30 days from incident date",
            required_evidence=["Corrective action plan", "Management approval", "Implementation evidence", "Testing results"],
            risk_level="High", confidence_score=0.90,
            clause_trust_score=78, status="Needs Review",
            human_review_required=True, grounded=True,
            source_citation="Clause 4.1 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 11, 0),
        ),
        Obligation(
            id=6, obligation_id="OBL-TG-006", clause_id=9,
            obligation_text="Maintain minimum system capacity headroom of 1.5x peak load. Conduct disaster recovery drills at least once every six months with documented results.",
            obligation_type="Operational", trigger_type="Recurring",
            intermediary="Stock Broker", owner_role="Technology Operations Head",
            department="Technology Operations",
            deadline_rule="Every 6 months (DR drills); Continuous (capacity)",
            required_evidence=["Capacity planning report", "DR drill report", "DR drill results documentation", "System performance benchmarks"],
            risk_level="High", confidence_score=0.87,
            clause_trust_score=72, status="Needs Review",
            human_review_required=True, grounded=True,
            source_citation="Clause 6.1 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 11, 10),
        ),
        Obligation(
            id=7, obligation_id="OBL-TG-007", clause_id=10,
            obligation_text="MD/CEO, CTO, and Compliance Officer jointly responsible for framework adherence. Quarterly compliance report to be placed before the Board.",
            obligation_type="Governance", trigger_type="Recurring",
            intermediary="Stock Broker", owner_role="Chief Compliance Officer",
            department="Compliance + Board",
            deadline_rule="Quarterly",
            required_evidence=["Board presentation", "Quarterly compliance report", "Board minutes"],
            risk_level="Medium", confidence_score=0.88,
            clause_trust_score=82, status="Approved",
            human_review_required=True, grounded=True,
            source_citation="Clause 7.1 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 11, 15),
            reviewed_at=datetime(2026, 1, 15, 11, 0),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=8, obligation_id="OBL-TG-008", clause_id=1,
            obligation_text="Verify applicability of framework: confirm broker provides electronic trading platforms and has more than 10,000 registered clients as on March 31 of previous financial year.",
            obligation_type="Documentation", trigger_type="Recurring",
            intermediary="Stock Broker", owner_role="Compliance Officer",
            department="Compliance",
            deadline_rule="Annual verification (by April 30)",
            required_evidence=["Client count certificate", "Platform inventory"],
            risk_level="Low", confidence_score=0.92,
            clause_trust_score=90, status="Approved",
            human_review_required=True, grounded=True,
            source_citation="Clause 1.1 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 11, 20),
            reviewed_at=datetime(2026, 1, 13, 15, 0),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=9, obligation_id="OBL-MC-001", clause_id=12,
            obligation_text="Conduct annual system audit by CERT-In empanelled auditor for algorithmic trading and DMA facilities.",
            obligation_type="Operational", trigger_type="Recurring",
            intermediary="Stock Broker", owner_role="Technology Operations Head",
            department="Technology Operations",
            deadline_rule="Annually",
            required_evidence=["System audit report", "Auditor certificate", "Remediation action items"],
            risk_level="Medium", confidence_score=0.86,
            clause_trust_score=75, status="AI Draft",
            human_review_required=True, grounded=True,
            source_citation="Clause 8.1 — Master Circular for Stock Brokers, SEBI/HO/MIRSD/MIRSD-SEC-2/P/CIR/2025/186",
            created_at=datetime(2025, 12, 22, 10, 0),
        ),
        Obligation(
            id=10, obligation_id="OBL-MC-002", clause_id=13,
            obligation_text="Implement adequate safeguards for client data protection and ensure need-to-know access controls.",
            obligation_type="Operational", trigger_type="One-time",
            intermediary="Stock Broker", owner_role="Chief Compliance Officer",
            department="Compliance + Technology Operations",
            deadline_rule="Ongoing compliance",
            required_evidence=["Data protection policy", "Access control matrix", "Periodic review report"],
            risk_level="High", confidence_score=0.84,
            clause_trust_score=68, status="Needs Review",
            human_review_required=True, grounded=True,
            source_citation="Clause 9.3 — Master Circular for Stock Brokers, SEBI/HO/MIRSD/MIRSD-SEC-2/P/CIR/2025/186",
            created_at=datetime(2025, 12, 22, 10, 15),
        ),
        Obligation(
            id=11, obligation_id="OBL-MC-003", clause_id=11,
            obligation_text="Report all technical glitches to exchange within one hour and submit RCA within 7 working days.",
            obligation_type="Reporting", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role="Compliance Officer",
            department="Compliance",
            deadline_rule="1 hour (notification) / 7 working days (RCA)",
            required_evidence=["Glitch notification", "RCA report"],
            risk_level="High", confidence_score=0.90,
            clause_trust_score=85, status="Approved",
            human_review_required=True, grounded=True,
            source_citation="Clause 7.6 — Master Circular for Stock Brokers (Legacy framework)",
            created_at=datetime(2025, 12, 22, 10, 30),
            reviewed_at=datetime(2025, 12, 28, 14, 0),
            reviewed_by="Priya Sharma",
        ),
        Obligation(
            id=12, obligation_id="OBL-TG-009", clause_id=8,
            obligation_text="Ensure compliance with disincentive framework. Major glitches affecting >5% active clients attract higher penalties from exchanges.",
            obligation_type="Governance", trigger_type="Event-triggered",
            intermediary="Stock Broker", owner_role=None,
            department=None,
            deadline_rule="Ongoing",
            required_evidence=["Penalty assessment record", "Client impact analysis"],
            risk_level="Critical", confidence_score=0.82,
            clause_trust_score=55, status="Needs Review",
            human_review_required=True, grounded=True,
            source_citation="Clause 5.1 — Framework for Handling Technical Glitches, SEBI/HO/38/44/12(1)2026",
            created_at=datetime(2026, 1, 12, 11, 30),
        ),
    ]
    db.add_all(obligations)

    # ── Workflows ─────────────────────────────────────────────
    workflows = [
        Workflow(
            id=1, workflow_id="WF-TG-001", obligation_id=1,
            title="Technical Glitch Incident Notification",
            owner="Rahul Mehta", department="Technology Operations",
            due_date=today + timedelta(days=1),
            status="Completed", escalation_level=0, completion_percentage=100,
            steps=[
                {"step": 1, "title": "Detect incident", "status": "Completed"},
                {"step": 2, "title": "Classify severity", "status": "Completed"},
                {"step": 3, "title": "Notify exchange within 2 hours", "status": "Completed"},
                {"step": 4, "title": "Notify affected clients", "status": "Completed"},
                {"step": 5, "title": "Document notification evidence", "status": "Completed"},
            ],
            created_at=datetime(2026, 1, 14, 10, 0),
        ),
        Workflow(
            id=2, workflow_id="WF-TG-002", obligation_id=2,
            title="Preliminary Incident Report Submission",
            owner="Rahul Mehta", department="Technology Operations",
            due_date=today + timedelta(days=3),
            status="In Progress", escalation_level=0, completion_percentage=60,
            steps=[
                {"step": 1, "title": "Gather system logs", "status": "Completed"},
                {"step": 2, "title": "Count impacted clients", "status": "Completed"},
                {"step": 3, "title": "Prepare preliminary report", "status": "In Progress"},
                {"step": 4, "title": "Submit via Samuhik Prativedan Manch", "status": "Pending"},
                {"step": 5, "title": "Collect exchange acknowledgement", "status": "Pending"},
            ],
            created_at=datetime(2026, 1, 14, 10, 30),
        ),
        Workflow(
            id=3, workflow_id="WF-TG-003", obligation_id=3,
            title="Root Cause Analysis (RCA) Submission",
            owner="Rahul Mehta", department="Technology Operations + Compliance",
            due_date=today - timedelta(days=2),
            status="Overdue", escalation_level=2, completion_percentage=40,
            steps=[
                {"step": 1, "title": "Identify root cause", "status": "Completed"},
                {"step": 2, "title": "Conduct impact analysis", "status": "Completed"},
                {"step": 3, "title": "Draft RCA report", "status": "In Progress"},
                {"step": 4, "title": "Document corrective actions", "status": "Pending"},
                {"step": 5, "title": "Document preventive measures", "status": "Pending"},
                {"step": 6, "title": "Get management sign-off", "status": "Pending"},
                {"step": 7, "title": "Submit to exchange", "status": "Pending"},
            ],
            created_at=datetime(2026, 1, 15, 9, 0),
        ),
        Workflow(
            id=4, workflow_id="WF-TG-004", obligation_id=7,
            title="Quarterly Compliance Report to Board",
            owner="Priya Sharma", department="Compliance",
            due_date=today + timedelta(days=45),
            status="Pending", escalation_level=0, completion_percentage=10,
            steps=[
                {"step": 1, "title": "Compile quarterly incident data", "status": "In Progress"},
                {"step": 2, "title": "Prepare compliance summary", "status": "Pending"},
                {"step": 3, "title": "Get CTO inputs", "status": "Pending"},
                {"step": 4, "title": "Draft board presentation", "status": "Pending"},
                {"step": 5, "title": "Place before Board", "status": "Pending"},
            ],
            created_at=datetime(2026, 1, 16, 11, 0),
        ),
        Workflow(
            id=5, workflow_id="WF-TG-005", obligation_id=4,
            title="Portal Submission via Samuhik Prativedan Manch",
            owner="Priya Sharma", department="Compliance",
            due_date=today + timedelta(days=5),
            status="In Progress", escalation_level=1, completion_percentage=50,
            steps=[
                {"step": 1, "title": "Prepare submission documents", "status": "Completed"},
                {"step": 2, "title": "Upload to portal", "status": "In Progress"},
                {"step": 3, "title": "Collect acknowledgement receipt", "status": "Pending"},
                {"step": 4, "title": "Archive submission evidence", "status": "Pending"},
            ],
            created_at=datetime(2026, 1, 15, 14, 0),
        ),
    ]
    db.add_all(workflows)

    # ── Evidence ──────────────────────────────────────────────
    evidence_items = [
        Evidence(
            id=1, evidence_id="EV-001", obligation_id=1, workflow_id=1,
            file_name="incident_ticket_TG2026_001.pdf", evidence_type="Incident ticket",
            validation_status="Accepted", uploaded_by="Rahul Mehta",
            uploaded_at=datetime(2026, 1, 14, 11, 0),
        ),
        Evidence(
            id=2, evidence_id="EV-002", obligation_id=1, workflow_id=1,
            file_name="exchange_notification_BSE_20260114.pdf", evidence_type="Exchange notification record",
            validation_status="Accepted", uploaded_by="Priya Sharma",
            uploaded_at=datetime(2026, 1, 14, 12, 0),
        ),
        Evidence(
            id=3, evidence_id="EV-003", obligation_id=1, workflow_id=1,
            file_name="client_sms_log_20260114.csv", evidence_type="Client notification log",
            validation_status="Accepted", uploaded_by="Rahul Mehta",
            uploaded_at=datetime(2026, 1, 14, 13, 0),
        ),
        Evidence(
            id=4, evidence_id="EV-004", obligation_id=2, workflow_id=2,
            file_name="system_logs_extract_20260114.zip", evidence_type="System log",
            validation_status="Accepted", uploaded_by="Rahul Mehta",
            uploaded_at=datetime(2026, 1, 15, 9, 0),
        ),
        Evidence(
            id=5, evidence_id="EV-005", obligation_id=2, workflow_id=2,
            file_name="client_impact_analysis.xlsx", evidence_type="Impact assessment report",
            validation_status="Needs Review", uploaded_by="Rahul Mehta",
            uploaded_at=datetime(2026, 1, 15, 10, 0),
        ),
        Evidence(
            id=6, evidence_id="EV-006", obligation_id=3, workflow_id=3,
            file_name="rca_draft_v1.docx", evidence_type="RCA document",
            validation_status="Needs Review", uploaded_by="Rahul Mehta",
            uploaded_at=datetime(2026, 1, 20, 14, 0),
        ),
        Evidence(
            id=7, evidence_id="EV-007", obligation_id=7, workflow_id=4,
            file_name="q4_compliance_data.xlsx", evidence_type="Quarterly compliance report",
            validation_status="Pending", uploaded_by="Priya Sharma",
            uploaded_at=datetime(2026, 2, 1, 10, 0),
        ),
        Evidence(
            id=8, evidence_id="EV-008", obligation_id=4, workflow_id=5,
            file_name="samuhik_submission_receipt.pdf", evidence_type="Portal submission confirmation",
            validation_status="Accepted", uploaded_by="Priya Sharma",
            uploaded_at=datetime(2026, 1, 16, 11, 30),
        ),
        Evidence(
            id=9, evidence_id="EV-009", obligation_id=8, workflow_id=None,
            file_name="client_count_certificate_fy26.pdf", evidence_type="Client count certificate",
            validation_status="Accepted", uploaded_by="Priya Sharma",
            uploaded_at=datetime(2026, 4, 15, 10, 0),
        ),
    ]
    db.add_all(evidence_items)

    # ── Audit Events ──────────────────────────────────────────
    audit_events = [
        # Document events
        AuditEvent(entity_type="document", entity_id=1, action="Document uploaded",
                   actor="Priya Sharma", timestamp=datetime(2026, 1, 10, 9, 0),
                   details={"document": "Technical Glitch Framework 2026"}),
        AuditEvent(entity_type="document", entity_id=1, action="AI extraction started",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 10, 9, 5),
                   details={"pipeline": "ComplianceCompiler v1.0"}),
        AuditEvent(entity_type="document", entity_id=1, action="Clauses extracted",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 10, 9, 8),
                   details={"clause_count": 10}),
        AuditEvent(entity_type="document", entity_id=1, action="Obligations generated",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 10, 9, 12),
                   details={"obligation_count": 9, "avg_confidence": 0.89}),

        # Obligation lifecycle events
        AuditEvent(entity_type="obligation", entity_id=1, action="Obligation generated by AI",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 12, 10, 30),
                   details={"obligation_id": "OBL-TG-001", "confidence": 0.94}),
        AuditEvent(entity_type="obligation", entity_id=1, action="Citation validated",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 12, 10, 31),
                   details={"grounded": True, "source_found": True}),
        AuditEvent(entity_type="obligation", entity_id=1, action="Sent for human review",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 12, 10, 32),
                   details={"reviewer_queue": "Compliance Officer"}),
        AuditEvent(entity_type="obligation", entity_id=1, action="Approved by compliance officer",
                   actor="Priya Sharma", timestamp=datetime(2026, 1, 13, 14, 0),
                   details={"status": "Approved", "comments": "Clause correctly mapped"}),
        AuditEvent(entity_type="obligation", entity_id=1, action="Workflow created",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 14, 10, 0),
                   details={"workflow_id": "WF-TG-001"}),

        # Obligation 3 lifecycle
        AuditEvent(entity_type="obligation", entity_id=3, action="Obligation generated by AI",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 12, 10, 40),
                   details={"obligation_id": "OBL-TG-003", "confidence": 0.93}),
        AuditEvent(entity_type="obligation", entity_id=3, action="Approved by compliance officer",
                   actor="Priya Sharma", timestamp=datetime(2026, 1, 14, 9, 30),
                   details={"status": "Approved"}),
        AuditEvent(entity_type="obligation", entity_id=3, action="Workflow created",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 15, 9, 0),
                   details={"workflow_id": "WF-TG-003"}),
        AuditEvent(entity_type="obligation", entity_id=3, action="Workflow overdue — escalated",
                   actor="RegPilot AI", timestamp=datetime(2026, 2, 5, 8, 0),
                   details={"escalation_level": 2, "reason": "RCA deadline exceeded"}),
        AuditEvent(entity_type="obligation", entity_id=3, action="Evidence uploaded (partial)",
                   actor="Rahul Mehta", timestamp=datetime(2026, 1, 20, 14, 0),
                   details={"evidence_id": "EV-006", "type": "RCA document", "status": "draft"}),

        # Evidence events
        AuditEvent(entity_type="evidence", entity_id=1, action="Evidence uploaded",
                   actor="Rahul Mehta", timestamp=datetime(2026, 1, 14, 11, 0),
                   details={"file": "incident_ticket_TG2026_001.pdf"}),
        AuditEvent(entity_type="evidence", entity_id=1, action="Evidence validated",
                   actor="Priya Sharma", timestamp=datetime(2026, 1, 14, 15, 0),
                   details={"status": "Accepted"}),

        # Gap detection events
        AuditEvent(entity_type="obligation", entity_id=3, action="Gap detected: missing evidence",
                   actor="RegPilot AI", timestamp=datetime(2026, 2, 6, 9, 0),
                   details={"gap": "RCA not finalized", "required": 5, "uploaded": 1}),
        AuditEvent(entity_type="obligation", entity_id=12, action="Gap detected: no owner assigned",
                   actor="RegPilot AI", timestamp=datetime(2026, 1, 15, 8, 0),
                   details={"gap": "Obligation has no owner or department"}),
    ]
    db.add_all(audit_events)

    db.commit()


# ── Source text constants ──────────────────────────────────────

TECH_GLITCH_CIRCULAR_TEXT = """SECURITIES AND EXCHANGE BOARD OF INDIA
CIRCULAR

SEBI/HO/38/44/12(1)2026-MIRSD-TPD1
January 09, 2026

To,
All Stock Brokers through Stock Exchanges

Subject: Framework for Handling Technical Glitches in Stock Brokers' Electronic Trading Systems

1. Background

1.1 SEBI has been receiving reports of technical glitches faced by stock brokers in their electronic trading systems. In order to strengthen the framework for handling such glitches and to ensure business continuity, this circular is being issued under the SEBI (Stock Brokers) Regulations, 2026.

2. Applicability

2.1 This framework shall be applicable to stock brokers who provide electronic trading platforms (web-based or mobile applications) and have more than 10,000 registered clients as on March 31 of the previous financial year.

2.2 Stock brokers not meeting the above threshold may voluntarily adopt this framework as a best practice.

3. Definition of Technical Glitch

3.1 A 'Technical Glitch' means any hardware, software, or network malfunction in the stock broker's electronic trading system — related to trading or risk management — that disrupts trading activities (such as login, order placement, modification, cancellation, or viewing of funds and margins) for five minutes or more during trading hours.

3.2 The following shall generally not be considered as technical glitches:
(a) Failures of global internet or cloud service providers
(b) Issues at the Stock Exchange or Clearing Corporation level
(c) Problems with banks, payment gateways, or payment aggregators
(d) Issues during account opening or KYC processing
(e) Non-trading tool errors (technical charts, P&L statements)
(f) Minor glitches where one trading channel (web/mobile) remains operational

4. Notification Requirements

4.1 Upon detection of a technical glitch, the stock broker shall notify the concerned stock exchange(s) and affected clients within two hours of the occurrence. The notification shall include the nature of the glitch, estimated time of resolution, and impact assessment.

4.2 A preliminary incident report shall be submitted to the exchange by the next trading day (T+1). The report shall contain details of the glitch including timestamp, systems affected, number of clients impacted, and immediate corrective steps taken.

4.3 A detailed Root Cause Analysis (RCA) must be submitted within 14 working days of the incident. The RCA shall identify the root cause, impact analysis, corrective actions implemented, and preventive measures to avoid recurrence.

4.4 All reports related to technical glitches shall be submitted through the centralized 'Samuhik Prativedan Manch' portal maintained by the stock exchanges.

5. Corrective Action Plan

5.1 The stock broker shall prepare and implement a corrective action plan within 30 days of the incident. The plan shall be approved by the management and made available for inspection by SEBI or the stock exchange.

6. Disincentive Framework

6.1 Stock exchanges shall levy penalties on brokers based on the severity and frequency of technical glitches. Major glitches affecting more than 5% of active clients shall attract higher penalties.

7. Capacity Planning and Disaster Recovery

7.1 Stock brokers shall maintain adequate system capacity with a minimum headroom of 1.5x peak load. Disaster recovery drills shall be conducted at least once every six months with documented results.

8. Management Accountability

8.1 The Managing Director or CEO, along with the Chief Technology Officer and the Compliance Officer, shall be jointly responsible for ensuring adherence to this framework. A quarterly compliance report shall be placed before the Board.

This circular is issued in exercise of the powers conferred under Section 11(1) of the Securities and Exchange Board of India Act, 1992.

Sd/-
Whole Time Member
SEBI"""


MASTER_CIRCULAR_EXCERPT = """SECURITIES AND EXCHANGE BOARD OF INDIA
MASTER CIRCULAR FOR STOCK BROKERS

SEBI/HO/MIRSD/MIRSD-SEC-2/P/CIR/2025/186
December 16, 2025

Chapter 7: Technology and Systems

7.6 Technical Glitch Reporting (Previous Framework)
Stock brokers shall report all technical glitches to the exchange within one hour of occurrence. A root cause analysis shall be submitted within 7 working days. This clause has been superseded by SEBI/HO/38/44/12(1)2026-MIRSD-TPD1 effective January 9, 2026.

Chapter 8: System Audit

8.1 System Audit Requirements
Every stock broker using algorithmic trading or providing Direct Market Access shall conduct a system audit at least once a year by a CERT-In empanelled auditor.

Chapter 9: Client Protection

9.3 Client Data Protection
Stock brokers shall implement adequate safeguards for protection of client data and ensure compliance with applicable data protection regulations. Access to client data shall be restricted on a need-to-know basis."""
