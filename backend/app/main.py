"""RegPilot AI — FastAPI Backend.

Clause-grounded compliance compiler for SEBI stockbrokers.
SEBI Securities Market TechSprint 2026 — Track 2.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.database import init_db, SessionLocal
from app.db.seed import seed_database
from app.api import documents, obligations, workflows, evidence, audit
from app.core.config import UPLOAD_DIR, EVIDENCE_DIR, REPORT_DIR

app = FastAPI(
    title="RegPilot AI",
    description="Clause-grounded compliance compiler for SEBI stockbrokers",
    version="1.0.0",
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/evidence", StaticFiles(directory=str(EVIDENCE_DIR)), name="evidence")
app.mount("/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")

# Register API routers
app.include_router(documents.router)
app.include_router(obligations.router)
app.include_router(workflows.router)
app.include_router(evidence.router)
app.include_router(audit.router)


@app.on_event("startup")
def startup():
    """Initialize database and seed demo data on startup."""
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "RegPilot AI", "version": "1.0.0"}
