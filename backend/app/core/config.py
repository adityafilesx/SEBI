"""Core configuration for RegPilot AI backend."""

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
EVIDENCE_DIR = BASE_DIR / "evidence"
REPORT_DIR = BASE_DIR / "reports"
DEMO_DOCS_DIR = BASE_DIR / "demo_docs"
DATABASE_URL = f"sqlite:///{BASE_DIR / 'regpilot.db'}"

# Ensure directories exist
for d in [UPLOAD_DIR, EVIDENCE_DIR, REPORT_DIR, DEMO_DOCS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Optional LLM adapter config (not required for demo)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "deterministic")  # deterministic | openai | gemini | claude
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
