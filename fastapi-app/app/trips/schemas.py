"""
Drishti-Path — Trip Schemas
"""
from __future__ import annotations
from typing import Optional

from datetime import datetime
from pydantic import BaseModel


class GpsPoint(BaseModel):
    lat: float
    lng: float


class TripCreate(BaseModel):
    trip_id: Optional[str] = None
    started_at: Optional[datetime] = None
    gps_start: Optional[GpsPoint] = None
    device_model: Optional[str] = None
    android_version: Optional[str] = None
    app_version: Optional[str] = None
    # Also accept flat GPS from Flutter fallback payload
    gps_start_lat: Optional[float] = None
    gps_start_lng: Optional[float] = None


class TripUpdate(BaseModel):
    ended_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    status: Optional[str] = None
    total_clips: Optional[int] = None
    total_ai_flags: Optional[int] = None
    total_voice_flags: Optional[int] = None
    total_manual_flags: Optional[int] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime]
    duration_ms: Optional[int]
    status: str
    review_status: str
    gps_start_lat: Optional[float]
    gps_start_lng: Optional[float]
    device_model: Optional[str]
    total_clips: int
    total_ai_flags: int
    total_voice_flags: int
    total_manual_flags: int
    reviewed_clips: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
