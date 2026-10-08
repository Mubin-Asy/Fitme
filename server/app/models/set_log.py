from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workout = relationship("Workout", back_populates="exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")
    sets = relationship("ExerciseSet", back_populates="workout_exercise", cascade="all, delete-orphan", order_by="ExerciseSet.set_number")


class ExerciseSet(Base):
    __tablename__ = "exercise_sets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workout_exercise_id = Column(Integer, ForeignKey("workout_exercises.id", ondelete="CASCADE"), nullable=False, index=True)
    set_number = Column(Integer, nullable=False)
    set_type = Column(String(20), default="normal")  # warmup, normal, drop, failure
    reps = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False, default=0.0)
    rpe = Column(Float, nullable=True)  # Rate of Perceived Exertion (1.0 to 10.0)
    is_personal_record = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workout_exercise = relationship("WorkoutExercise", back_populates="sets")

    __table_args__ = (
        CheckConstraint("reps > 0", name="chk_positive_reps"),
        CheckConstraint("weight_kg >= 0", name="chk_non_negative_weight"),
        Index("idx_set_we_id", "workout_exercise_id"),
    )
