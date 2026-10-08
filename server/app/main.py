from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.init_db import init_db
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Modern lifespan event handler for database initialization and graceful shutdown.
    Creates schema tables and seeds initial data for the 10 group members.
    """
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize seed data
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
        
    yield
    # Clean shutdown tasks if needed
    engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Fitness Tracking API for Private Group (Max 10 Athletes). Built with FastAPI & PostgreSQL architectural patterns.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "max_group_capacity": settings.MAX_GROUP_USERS
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "health": "/health"
    }
