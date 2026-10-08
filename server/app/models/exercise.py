from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), unique=True, index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)  # Chest, Back, Legs, Shoulders, Arms, Core, Cardio
    primary_muscle = Column(String(50), index=True, nullable=False)
    secondary_muscles = Column(String(100), nullable=True)
    equipment = Column(String(50), default="Barbell", nullable=False)  # Barbell, Dumbbell, Cable, Machine, Bodyweight
    instructions = Column(Text, nullable=True)
    is_compound = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")
