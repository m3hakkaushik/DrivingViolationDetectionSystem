"""
Drishti-Path — Clip Models
"""
from __future__ import annotations
from typing import Optional

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Clip(Base):
    __tablename__ = "clips"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    storage_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    thumbnail_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    timestamp_source: Mapped[str] = mapped_column(String(10), nullable=False)  # AI | VOICE | MANUAL
    ai_device_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ai_server_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ai_server_label: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # LEFT | RIGHT
    ai_evidence_frames: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    gps_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gps_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    video_offset_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    clip_duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    review_status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING | CONFIRMED | REJECTED
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fine_status: Mapped[str] = mapped_column(String(10), default="NONE")  # NONE | QUEUED | ISSUED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
