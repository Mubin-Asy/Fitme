from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, Float, Text, DateTime, ForeignKey, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    weight_kg = Column(Float, nullable=False)
    body_fat_pct = Column(Float, nullable=True)
    muscle_mass_kg = Column(Float, nullable=True)
    resting_heart_rate = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    energy_level = Column(Integer, nullable=True)  # 1-10
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="body_metrics")

    __table_args__ = (
        CheckConstraint("weight_kg > 0", name="chk_metric_weight"),
        Index("idx_body_metrics_user_date", "user_id", "recorded_at"),
    )
