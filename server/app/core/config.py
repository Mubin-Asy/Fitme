import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fitme"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 10 users max constraint for this private group instance
    MAX_GROUP_USERS: int = 10
    
    # Database URL: Defaults to local SQLite for instant zero-config run,
    # or PostgreSQL when DATABASE_URL is supplied (e.g., postgresql+psycopg://user:pass@localhost:5432/fitme)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fitme.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-fitme-production-secure-382947192")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
