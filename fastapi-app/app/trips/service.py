"""
Drishti-Path — Trip Service
"""
from __future__ import annotations
from typing import Optional

from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.trips.models import Trip
from app.clips.models import Clip
from app.auth.models import User
from app.trips.schemas import TripCreate, TripUpdate, TripResponse


def ensure_naive(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is not None and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt


async def create_trip(db: AsyncSession, user_id: str, data: TripCreate) -> Trip:
    # Resolve GPS: accept nested gps_start obj or flat lat/lng fields
    gps_lat = None
    gps_lng = None
    if data.gps_start:
        gps_lat = data.gps_start.lat
        gps_lng = data.gps_start.lng
    elif data.gps_start_lat is not None:
        gps_lat = data.gps_start_lat
        gps_lng = data.gps_start_lng

    # Strip timezone info: DB column is TIMESTAMP WITHOUT TIME ZONE
    # Pydantic parses ISO "Z" suffix as UTC-aware; asyncpg rejects mixed tz/naive
    started_at = ensure_naive(data.started_at or datetime.utcnow())

    trip = Trip(
        id=data.trip_id or None,
        user_id=user_id,
        started_at=started_at,
        gps_start_lat=gps_lat,
        gps_start_lng=gps_lng,
        device_model=data.device_model,
        android_version=data.android_version,
        app_version=data.app_version,
    )
    db.add(trip)
    await db.flush()
    return trip


async def get_trip(db: AsyncSession, trip_id: str, user_id: Optional[str] = None) -> Trip:
    query = select(Trip).where(Trip.id == trip_id)
    if user_id:
        query = query.where(Trip.user_id == user_id)
    result = await db.execute(query)
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip


async def list_trips(db: AsyncSession, user_id: Optional[str] = None, status: Optional[str] = None) -> list[Trip]:
    query = select(Trip).order_by(Trip.started_at.desc())
    if user_id:
        query = query.where(Trip.user_id == user_id)
    if status:
        query = query.where(Trip.status == status)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_trip(db: AsyncSession, trip_id: str, data: TripUpdate) -> Trip:
    trip = await get_trip(db, trip_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        if isinstance(value, datetime):
            value = ensure_naive(value)
        setattr(trip, field, value)
    await db.flush()
    return trip


async def build_trip_response(db: AsyncSession, trip: Trip) -> TripResponse:
    """Build a TripResponse with joined user_name and computed reviewed_clips."""
    # Join user name
    user_result = await db.execute(select(User.name).where(User.id == trip.user_id))
    user_name = user_result.scalar_one_or_none()

    # Count reviewed clips
    reviewed_result = await db.execute(
        select(func.count(Clip.id)).where(
            Clip.trip_id == trip.id,
            Clip.review_status.in_(["CONFIRMED", "REJECTED"])
        )
    )
    reviewed_clips = reviewed_result.scalar_one() or 0

    base = TripResponse.model_validate(trip)
    return base.model_copy(update={"user_name": user_name, "reviewed_clips": reviewed_clips})
