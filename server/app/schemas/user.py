from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = None
    fitness_goal: Optional[str] = "Strength & Conditioning"
    target_calories: Optional[int] = 2400
    target_water_ml: Optional[int] = 3200
    target_weight_kg: Optional[float] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = "member"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    fitness_goal: Optional[str] = None
    target_calories: Optional[int] = None
    target_water_ml: Optional[int] = None
    target_weight_kg: Optional[float] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    username_or_email: str
    password: str
