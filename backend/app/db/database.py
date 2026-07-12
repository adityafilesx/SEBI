"""SQLAlchemy database setup for RegPilot AI."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import DATABASE_URL


engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables."""
    from app.models.models import (  # noqa: F401 — imported for side-effect
        User, RegulatoryDocument, Clause, Obligation,
        Workflow, Evidence, AuditEvent,
    )
    Base.metadata.create_all(bind=engine)
