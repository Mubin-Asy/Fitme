from fastapi import APIRouter
from app.api.v1.endpoints import users, exercises, workouts, nutrition, metrics, dashboard

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["Exercise Library"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["Workouts & Sets"])
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition & Hydration"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Body Metrics & Recovery"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard & Group Analytics"])
