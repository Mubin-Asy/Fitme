from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class NutritionLogBase(BaseModel):
    log_date: date = Field(default_factory=date.today)
    meal_type: str = Field(..., example="breakfast")
    food_name: str = Field(..., min_length=1, max_length=150)
    calories: int = Field(..., ge=0)
    protein_g: float = Field(default=0.0, ge=0.0)
    carbs_g: float = Field(default=0.0, ge=0.0)
    fat_g: float = Field(default=0.0, ge=0.0)
    water_ml: int = Field(default=0, ge=0)


class NutritionLogCreate(NutritionLogBase):
    user_id: int


class NutritionLogResponse(NutritionLogBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
