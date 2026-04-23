"""
Drishti-Path — Fine Models
"""
from __future__ import annotations
from typing import Optional

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Fine(Base):
    __tablename__ = "fines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    clip_id: Mapped[str] = mapped_column(String(36), ForeignKey("clips.id"), nullable=False, index=True)
    trip_id: Mapped[str] = mapped_column(String(36), ForeignKey("trips.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    issued_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    license_plate: Mapped[str] = mapped_column(String(20), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    fine_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(5), default="INR")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="ISSUED")  # ISSUED | PAID | CANCELLED | DISPUTED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ReviewerDecision(Base):
    __tablename__ = "reviewer_decisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    clip_id: Mapped[str] = mapped_column(String(36), ForeignKey("clips.id"), nullable=False, index=True)
    reviewer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)  # CONFIRMED | REJECTED
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    decided_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
