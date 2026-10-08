from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.workout import Workout
from app.models.set_log import WorkoutExercise, ExerciseSet
from app.models.exercise import Exercise
from app.schemas.workout import WorkoutResponse, WorkoutCreate

router = APIRouter()


@router.get("/", response_model=List[WorkoutResponse])
def get_workouts(
    user_id: Optional[int] = Query(None, description="Filter workouts by user"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Workout).options(
        joinedload(Workout.exercises).joinedload(WorkoutExercise.exercise),
        joinedload(Workout.exercises).joinedload(WorkoutExercise.sets)
    )
    if user_id:
        query = query.filter(Workout.user_id == user_id)
    return query.order_by(Workout.started_at.desc()).limit(limit).all()


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).options(
        joinedload(Workout.exercises).joinedload(WorkoutExercise.exercise),
        joinedload(Workout.exercises).joinedload(WorkoutExercise.sets)
    ).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(workout_in: WorkoutCreate, db: Session = Depends(get_db)):
    """Create workout with nested exercises and sets, auto-calculating tonnage and PRs."""
    started_at = workout_in.started_at or datetime.now(timezone.utc)
    completed_at = workout_in.completed_at or (started_at if workout_in.duration_mins > 0 else None)

    # Calculate total volume across all sets
    total_vol = 0.0
    for ex_data in workout_in.exercises:
        for s in ex_data.sets:
            if s.set_type != "warmup":
                total_vol += (s.weight_kg * s.reps)

    workout = Workout(
        user_id=workout_in.user_id,
        title=workout_in.title,
        notes=workout_in.notes,
        started_at=started_at,
        completed_at=completed_at,
        duration_mins=workout_in.duration_mins,
        total_volume_kg=round(total_vol, 2),
        status=workout_in.status,
        metadata_json=workout_in.metadata_json or "{}"
    )
    db.add(workout)
    db.flush()

    for ex_in in workout_in.exercises:
        we = WorkoutExercise(
            workout_id=workout.id,
            exercise_id=ex_in.exercise_id,
            order_index=ex_in.order_index,
            notes=ex_in.notes
        )
        db.add(we)
        db.flush()

        # Check existing PR for this user and exercise to see if new set breaks PR
        prev_max_weight = db.query(ExerciseSet.weight_kg)\
            .join(WorkoutExercise)\
            .join(Workout)\
            .filter(
                Workout.user_id == workout_in.user_id,
                WorkoutExercise.exercise_id == ex_in.exercise_id,
                ExerciseSet.set_type != "warmup"
            ).order_by(ExerciseSet.weight_kg.desc()).first()
        
        highest_recorded = prev_max_weight[0] if prev_max_weight else 0.0

        for s_in in ex_in.sets:
            is_new_pr = False
            if s_in.set_type != "warmup" and s_in.weight_kg > highest_recorded:
                is_new_pr = True
                highest_recorded = s_in.weight_kg

            new_set = ExerciseSet(
                workout_exercise_id=we.id,
                set_number=s_in.set_number,
                set_type=s_in.set_type,
                reps=s_in.reps,
                weight_kg=s_in.weight_kg,
                rpe=s_in.rpe,
                is_personal_record=is_new_pr or s_in.is_personal_record
            )
            db.add(new_set)

    db.commit()

    # Re-fetch full object with relations
    return db.query(Workout).options(
        joinedload(Workout.exercises).joinedload(WorkoutExercise.exercise),
        joinedload(Workout.exercises).joinedload(WorkoutExercise.sets)
    ).filter(Workout.id == workout.id).first()


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    db.delete(workout)
    db.commit()
    return None
