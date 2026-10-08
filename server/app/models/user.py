from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(20), default="member")  # admin, member
    bio = Column(Text, nullable=True)
    fitness_goal = Column(String(100), default="Strength & Conditioning")
    target_calories = Column(Integer, default=2400)
    target_water_ml = Column(Integer, default=3200)
    target_weight_kg = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    nutrition_logs = relationship("NutritionLog", back_populates="user", cascade="all, delete-orphan")
    body_metrics = relationship("BodyMetric", back_populates="user", cascade="all, delete-orphan")
