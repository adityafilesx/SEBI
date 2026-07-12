# RegPilot AI

**Clause-grounded compliance compiler for SEBI-registered stockbrokers**

SEBI Securities Market TechSprint 2026 — Track 2: Regulatory Compliance for Intermediaries

## What it does

RegPilot AI converts regulatory text into structured compliance outputs:

```
SEBI Circular → Clause Extraction → Obligation Generation → Human Approval → Workflow → Evidence Tracking → Gap Detection → Audit Report
```

This is **not a chatbot**. It's a compliance compiler with:
- Real PDF text extraction (PyMuPDF)
- Rule-based clause segmentation
- Deterministic obligation generation
- Human-in-the-loop governance
- ClauseTrust™ scoring
- Evidence completeness tracking
- Regulatory change impact analysis
- Audit-ready report generation

## Demo Scenario

> A new SEBI technical-glitch circular (Jan 2026) is processed. RegPilot AI extracts obligations, identifies that Technology and Compliance teams must act, generates an incident-reporting workflow, checks whether RCA and exchange-submission evidence exists, detects missing evidence, and generates an audit report.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + TypeScript + Tailwind CSS v4 |
| Backend | FastAPI + SQLAlchemy + SQLite |
| PDF Extraction | PyMuPDF (fitz) |
| Charts | Recharts |
| Icons | Lucide React |
| AI Pipeline | Deterministic demo-safe (rule-based + seeded) |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
SEBI_Prototype/
├── frontend/          # React + TypeScript + Tailwind
│   └── src/
│       ├── pages/     # 7 pages (Landing, Dashboard, DocumentViewer, ReviewConsole, ObligationRegister, Workflows, AuditReport)
│       ├── components/# Shared UI + Layout
│       ├── lib/       # API client
│       └── types/     # TypeScript interfaces
├── backend/           # FastAPI + SQLAlchemy
│   └── app/
│       ├── api/       # REST endpoints
│       ├── models/    # SQLAlchemy models
│       ├── schemas/   # Pydantic validation
│       ├── services/  # ComplianceCompiler, PDF extractor, Clause segmenter
│       └── db/        # Database + seed data
└── README.md
```

## Novelty Features

1. **Compliance Compiler Pipeline** — Not a chatbot, structured output
2. **ClauseTrust Score** — 5-factor trust metric (0-100)
3. **Human-in-the-Loop** — No obligation active until human-approved
4. **Evidence Completeness** — Required vs uploaded evidence tracking
5. **Audit Replay Timeline** — Full lifecycle traceability
6. **Regulatory Diff** — Old vs new framework comparison
7. **Hallucination Guardrail** — Grounded/ungrounded indicators
8. **Regulatory Change Impact Radar** — Impact analysis for new circulars

## Team

SEBI TechSprint 2026 — Track 2
