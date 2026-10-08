from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseResponse, ExerciseCreate

router = APIRouter()


@router.get("/", response_model=List[ExerciseResponse])
def get_exercises(
    category: Optional[str] = Query(None, description="Filter by category (Chest, Back, Legs, etc.)"),
    equipment: Optional[str] = Query(None, description="Filter by equipment"),
    search: Optional[str] = Query(None, description="Search exercise by name or muscle"),
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)
    if category:
        query = query.filter(Exercise.category.ilike(f"%{category}%"))
    if equipment:
        query = query.filter(Exercise.equipment.ilike(f"%{equipment}%"))
    if search:
        query = query.filter(
            (Exercise.name.ilike(f"%{search}%")) | (Exercise.primary_muscle.ilike(f"%{search}%"))
        )
    return query.order_by(Exercise.category, Exercise.name).all()


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(exercise_in: ExerciseCreate, db: Session = Depends(get_db)):
    existing = db.query(Exercise).filter(Exercise.name == exercise_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Exercise with this name already exists")
    
    new_ex = Exercise(**exercise_in.model_dump())
    db.add(new_ex)
    db.commit()
    db.refresh(new_ex)
    return new_ex
