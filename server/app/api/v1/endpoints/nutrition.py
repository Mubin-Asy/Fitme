from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.nutrition import NutritionLog
from app.schemas.nutrition import NutritionLogResponse, NutritionLogCreate

router = APIRouter()


@router.get("/", response_model=List[NutritionLogResponse])
def get_nutrition_logs(
    user_id: int = Query(..., description="User ID"),
    log_date: Optional[date] = Query(None, description="Filter by date (default today)"),
    db: Session = Depends(get_db)
):
    query = db.query(NutritionLog).filter(NutritionLog.user_id == user_id)
    if log_date:
        query = query.filter(NutritionLog.log_date == log_date)
    return query.order_by(NutritionLog.created_at.asc()).all()


@router.get("/summary")
def get_daily_macro_summary(
    user_id: int = Query(..., description="User ID"),
    log_date: Optional[date] = Query(None, description="Log date"),
    db: Session = Depends(get_db)
):
    target_date = log_date or date.today()
    logs = db.query(NutritionLog).filter(
        NutritionLog.user_id == user_id,
        NutritionLog.log_date == target_date
    ).all()

    total_cals = sum(l.calories for l in logs)
    total_protein = sum(l.protein_g for l in logs)
    total_carbs = sum(l.carbs_g for l in logs)
    total_fat = sum(l.fat_g for l in logs)
    total_water = sum(l.water_ml for l in logs)

    return {
        "date": target_date.isoformat(),
        "total_calories": total_cals,
        "total_protein_g": round(total_protein, 1),
        "total_carbs_g": round(total_carbs, 1),
        "total_fat_g": round(total_fat, 1),
        "total_water_ml": total_water,
        "item_count": len(logs)
    }


@router.post("/", response_model=NutritionLogResponse, status_code=status.HTTP_201_CREATED)
def create_nutrition_log(log_in: NutritionLogCreate, db: Session = Depends(get_db)):
    new_log = NutritionLog(**log_in.model_dump())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nutrition_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(NutritionLog).filter(NutritionLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Nutrition log entry not found")
    db.delete(log)
    db.commit()
    return None
