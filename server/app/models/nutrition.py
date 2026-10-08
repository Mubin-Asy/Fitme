from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, ForeignKey, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date = Column(Date, default=date.today, nullable=False, index=True)
    meal_type = Column(String(30), nullable=False)  # breakfast, lunch, dinner, snack, pre_workout, post_workout
    food_name = Column(String(150), nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Float, default=0.0, nullable=False)
    carbs_g = Column(Float, default=0.0, nullable=False)
    fat_g = Column(Float, default=0.0, nullable=False)
    water_ml = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="nutrition_logs")

    __table_args__ = (
        CheckConstraint("calories >= 0", name="chk_nutrition_calories"),
        CheckConstraint("protein_g >= 0", name="chk_nutrition_protein"),
        CheckConstraint("carbs_g >= 0", name="chk_nutrition_carbs"),
        CheckConstraint("fat_g >= 0", name="chk_nutrition_fat"),
        CheckConstraint("water_ml >= 0", name="chk_nutrition_water"),
        Index("idx_nutrition_user_date", "user_id", "log_date"),
    )
