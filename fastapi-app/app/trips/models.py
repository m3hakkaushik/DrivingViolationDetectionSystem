"""
Drishti-Path — Trip Models
"""
from __future__ import annotations
from typing import Optional

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="RECORDING")  # RECORDING | PROCESSING | UPLOADED | UNDER_REVIEW | REVIEWED | FINES_ISSUED
    gps_start_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gps_start_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    device_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    android_version: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    app_version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    total_clips: Mapped[int] = mapped_column(Integer, default=0)
    total_ai_flags: Mapped[int] = mapped_column(Integer, default=0)
    total_voice_flags: Mapped[int] = mapped_column(Integer, default=0)
    total_manual_flags: Mapped[int] = mapped_column(Integer, default=0)
    uploaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    review_status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING | IN_PROGRESS | COMPLETED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
