from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.exercise import ExerciseResponse


class SetLogBase(BaseModel):
    set_number: int = Field(..., ge=1)
    set_type: str = Field(default="normal")  # warmup, normal, drop, failure
    reps: int = Field(..., gt=0)
    weight_kg: float = Field(..., ge=0.0)
    rpe: Optional[float] = Field(None, ge=1.0, le=10.0)
    is_personal_record: bool = False


class SetLogCreate(SetLogBase):
    pass


class SetLogResponse(SetLogBase):
    id: int
    workout_exercise_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkoutExerciseBase(BaseModel):
    exercise_id: int
    order_index: int = 1
    notes: Optional[str] = None


class WorkoutExerciseCreate(WorkoutExerciseBase):
    sets: List[SetLogCreate] = []


class WorkoutExerciseResponse(WorkoutExerciseBase):
    id: int
    workout_id: int
    exercise: Optional[ExerciseResponse] = None
    sets: List[SetLogResponse] = []

    model_config = ConfigDict(from_attributes=True)


class WorkoutBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_mins: int = Field(default=0, ge=0)
    total_volume_kg: float = Field(default=0.0, ge=0.0)
    status: str = Field(default="completed")
    metadata_json: Optional[str] = "{}"


class WorkoutCreate(WorkoutBase):
    user_id: int
    exercises: List[WorkoutExerciseCreate] = []


class WorkoutResponse(WorkoutBase):
    id: int
    user_id: int
    exercises: List[WorkoutExerciseResponse] = []

    model_config = ConfigDict(from_attributes=True)
