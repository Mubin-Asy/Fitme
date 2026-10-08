from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.metric import BodyMetric
from app.schemas.metric import BodyMetricResponse, BodyMetricCreate

router = APIRouter()


@router.get("/", response_model=List[BodyMetricResponse])
def get_body_metrics(
    user_id: int = Query(..., description="User ID"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return db.query(BodyMetric).filter(
        BodyMetric.user_id == user_id
    ).order_by(BodyMetric.recorded_at.desc()).limit(limit).all()


@router.post("/", response_model=BodyMetricResponse, status_code=status.HTTP_201_CREATED)
def create_body_metric(metric_in: BodyMetricCreate, db: Session = Depends(get_db)):
    metric = BodyMetric(**metric_in.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric
