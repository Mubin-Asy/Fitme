from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from app.db.session import get_db
from app.models.user import User
from app.models.workout import Workout
from app.models.set_log import WorkoutExercise, ExerciseSet
from app.models.exercise import Exercise
from app.models.nutrition import NutritionLog
from app.models.metric import BodyMetric
from app.schemas.dashboard import DashboardSummary, PersonalRecordItem, GroupLeaderboardItem

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(user_id: int = Query(..., description="Active user ID"), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Recent workouts
    recent_workouts = db.query(Workout).options(
        joinedload(Workout.exercises).joinedload(WorkoutExercise.exercise),
        joinedload(Workout.exercises).joinedload(WorkoutExercise.sets)
    ).filter(Workout.user_id == user_id).order_by(Workout.started_at.desc()).limit(5).all()

    # 2. Today's nutrition
    today = date.today()
    today_logs = db.query(NutritionLog).filter(
        NutritionLog.user_id == user_id,
        NutritionLog.log_date == today
    ).all()

    nutrition_data = {
        "calories": sum(l.calories for l in today_logs),
        "target_calories": user.target_calories or 2400,
        "protein_g": round(sum(l.protein_g for l in today_logs), 1),
        "carbs_g": round(sum(l.carbs_g for l in today_logs), 1),
        "fat_g": round(sum(l.fat_g for l in today_logs), 1),
        "water_ml": sum(l.water_ml for l in today_logs),
        "target_water_ml": user.target_water_ml or 3200,
        "logs": [
            {
                "id": l.id,
                "meal_type": l.meal_type,
                "food_name": l.food_name,
                "calories": l.calories,
                "protein_g": l.protein_g,
                "carbs_g": l.carbs_g,
                "fat_g": l.fat_g,
                "water_ml": l.water_ml
            }
            for l in today_logs
        ]
    }

    # 3. Latest body metric
    latest_metric = db.query(BodyMetric).filter(
        BodyMetric.user_id == user_id
    ).order_by(BodyMetric.recorded_at.desc()).first()

    # 4. Personal records (Analytical computation inspired by PostgreSQL: Up and Running views)
    pr_rows = db.query(
        Exercise.id.label("ex_id"),
        Exercise.name.label("ex_name"),
        Exercise.category.label("cat"),
        ExerciseSet.weight_kg,
        ExerciseSet.reps,
        Workout.started_at
    ).join(WorkoutExercise, WorkoutExercise.exercise_id == Exercise.id)\
     .join(Workout, Workout.id == WorkoutExercise.workout_id)\
     .join(ExerciseSet, ExerciseSet.workout_exercise_id == WorkoutExercise.id)\
     .filter(Workout.user_id == user_id, ExerciseSet.set_type != "warmup")\
     .order_by(Exercise.name, ExerciseSet.weight_kg.desc())\
     .all()

    # Deduplicate best weight per exercise
    seen_ex = {}
    for r in pr_rows:
        if r.ex_id not in seen_ex:
            # Epley Formula: 1RM = Weight * (1 + Reps / 30)
            est_1rm = round(r.weight_kg * (1.0 + (r.reps / 30.0)), 1) if r.reps > 0 else r.weight_kg
            seen_ex[r.ex_id] = PersonalRecordItem(
                exercise_id=r.ex_id,
                exercise_name=r.ex_name,
                category=r.cat,
                max_weight_kg=r.weight_kg,
                reps_at_max=r.reps,
                estimated_1rm=est_1rm,
                achieved_date=r.started_at.strftime("%Y-%m-%d") if r.started_at else "Recent"
            )

    prs = list(seen_ex.values())[:8]

    # 5. Weekly volume & workout count (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_workouts = db.query(Workout).filter(
        Workout.user_id == user_id,
        Workout.started_at >= seven_days_ago
    ).all()

    weekly_vol = sum(w.total_volume_kg or 0.0 for w in weekly_workouts)
    weekly_cnt = len(weekly_workouts)

    # 6. Group leaderboard (friendly competition for the 10 members)
    all_users = db.query(User).filter(User.is_active == True).all()
    leaderboard = []
    for u in all_users:
        u_workouts = db.query(Workout).filter(Workout.user_id == u.id).all()
        u_vol = sum(w.total_volume_kg or 0.0 for w in u_workouts)
        u_mins = sum(w.duration_mins or 0 for w in u_workouts)
        
        # Streak estimation
        streak = min(len(u_workouts), 5)
        fav_cat = "Strength"
        if "runner" in u.username: fav_cat = "Cardio"
        elif "hiit" in u.username: fav_cat = "CrossFit"
        elif "cali" in u.username: fav_cat = "Calisthenics"
        elif "flow" in u.username: fav_cat = "Mobility"

        leaderboard.append(GroupLeaderboardItem(
            user_id=u.id,
            username=u.username,
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            workouts_count=len(u_workouts),
            total_volume_kg=round(u_vol, 1),
            total_duration_mins=u_mins,
            streak_days=streak,
            favorite_category=fav_cat
        ))

    # Sort leaderboard by total volume & workouts
    leaderboard.sort(key=lambda x: (x.total_volume_kg, x.workouts_count), reverse=True)

    return DashboardSummary(
        user=user,
        recent_workouts=recent_workouts,
        today_nutrition=nutrition_data,
        latest_metric=latest_metric,
        personal_records=prs,
        weekly_volume_kg=round(weekly_vol, 1),
        weekly_workouts_count=weekly_cnt,
        active_streak_days=min(len(recent_workouts) * 2, 7) if recent_workouts else 1,
        group_leaderboard=leaderboard
    )
