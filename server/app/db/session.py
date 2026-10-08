from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
from app.core.config import settings

# Engine configuration supporting PostgreSQL and SQLite fallback
connect_args = {}
engine_kwargs = {
    "echo": False,
}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL production pool settings recommended in PostgreSQL: Up and Running
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
    })

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Closes automatically when request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
