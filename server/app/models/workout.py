from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    notes = Column(Text, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    completed_at = Column(DateTime, nullable=True)
    duration_mins = Column(Integer, default=0)
    total_volume_kg = Column(Float, default=0.0)
    status = Column(String(20), default="completed")  # in_progress, completed, discarded
    metadata_json = Column(Text, default="{}")  # tags, overall RPE, equipment used

    user = relationship("User", back_populates="workouts")
    exercises = relationship("WorkoutExercise", back_populates="workout", cascade="all, delete-orphan", order_by="WorkoutExercise.order_index")

    __table_args__ = (
        Index("idx_workout_user_date", "user_id", "started_at"),
    )
