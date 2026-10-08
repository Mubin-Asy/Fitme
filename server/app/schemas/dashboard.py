from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.user import UserResponse
from app.schemas.workout import WorkoutResponse
from app.schemas.nutrition import NutritionLogResponse
from app.schemas.metric import BodyMetricResponse


class PersonalRecordItem(BaseModel):
    exercise_id: int
    exercise_name: str
    category: str
    max_weight_kg: float
    reps_at_max: int
    estimated_1rm: float
    achieved_date: str


class GroupLeaderboardItem(BaseModel):
    user_id: int
    username: str
    full_name: str
    avatar_url: Optional[str]
    workouts_count: int
    total_volume_kg: float
    total_duration_mins: int
    streak_days: int
    favorite_category: str


class DashboardSummary(BaseModel):
    user: UserResponse
    recent_workouts: List[WorkoutResponse]
    today_nutrition: Dict[str, Any]
    latest_metric: Optional[BodyMetricResponse]
    personal_records: List[PersonalRecordItem]
    weekly_volume_kg: float
    weekly_workouts_count: int
    active_streak_days: int
    group_leaderboard: List[GroupLeaderboardItem]
