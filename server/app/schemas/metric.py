from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BodyMetricBase(BaseModel):
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    weight_kg: float = Field(..., gt=0)
    body_fat_pct: Optional[float] = Field(None, ge=3.0, le=60.0)
    muscle_mass_kg: Optional[float] = Field(None, gt=0)
    resting_heart_rate: Optional[int] = Field(None, ge=30, le=220)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class BodyMetricCreate(BodyMetricBase):
    user_id: int


class BodyMetricResponse(BodyMetricBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
