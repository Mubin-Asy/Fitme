from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ExerciseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., example="Chest")
    primary_muscle: str = Field(..., example="Pectorals")
    secondary_muscles: Optional[str] = None
    equipment: str = Field(default="Barbell")
    instructions: Optional[str] = None
    is_compound: bool = False


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseResponse(ExerciseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
