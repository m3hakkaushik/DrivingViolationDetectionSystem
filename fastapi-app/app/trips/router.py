"""
Drishti-Path — Trip Router
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.service import get_current_user
from app.auth.models import User
from app.trips.schemas import TripCreate, TripResponse, TripUpdate
from app.trips import service

router = APIRouter()


@router.post("/", response_model=TripResponse, status_code=201)
async def create_trip(
    data: TripCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    trip = await service.create_trip(db, user.id, data)
    return await service.build_trip_response(db, trip)


@router.get("/", response_model=list[TripResponse])
async def list_trips(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    trips = await service.list_trips(db, user_id=user.id, status=status)
    return [await service.build_trip_response(db, t) for t in trips]


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    trip = await service.get_trip(db, trip_id, user.id)
    return await service.build_trip_response(db, trip)


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    data: TripUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await service.get_trip(db, trip_id, user.id)
    trip = await service.update_trip(db, trip_id, data)
    return await service.build_trip_response(db, trip)


@router.put("/{trip_id}/end", response_model=TripResponse)
async def end_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Seal a trip as ended and move it to UNDER_REVIEW status."""
    await service.get_trip(db, trip_id, user.id)
    update_data = TripUpdate(ended_at=datetime.utcnow(), status="UNDER_REVIEW")
    trip = await service.update_trip(db, trip_id, update_data)
    return await service.build_trip_response(db, trip)
