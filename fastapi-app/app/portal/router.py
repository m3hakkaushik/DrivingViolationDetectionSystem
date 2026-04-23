"""
Drishti-Path — Portal Router (Reviewer + Officer endpoints)
"""
from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.auth.service import require_role
from app.auth.models import User
from app.trips.models import Trip
from app.trips.schemas import TripResponse
from app.clips.models import Clip
from app.clips.schemas import ClipResponse
from app.clips.service import update_clip_review
from app.fines.service import issue_fine
from app.fines.router import FineResponse
from app.auth.schemas import UserResponse

router = APIRouter()


# === Schemas ===
class ReviewDecision(BaseModel):
    decision: str  # CONFIRMED | REJECTED
    note: Optional[str] = None
    reason: Optional[str] = None


class ReviewResponse(BaseModel):
    clip_id: str
    review_status: str
    fine_status: str


class FineIssuePortalRequest(BaseModel):
    clip_id: str
    license_plate: str
    violation_type: str
    fine_amount: int
    currency: str = "INR"
    notes: Optional[str] = None


# === Reviewer Endpoints ===

from app.trips.service import build_trip_response

@router.get("/trips/{trip_id}", response_model=TripResponse)
async def get_trip_for_review(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("REVIEWER", "ADMIN")),
):
    """Get a single trip by ID for reviewer/admin (not restricted by user_id)."""
    from app.trips import service as trip_service
    trip = await trip_service.get_trip(db, trip_id)  # No user_id filter
    return await trip_service.build_trip_response(db, trip)


@router.get("/trips", response_model=list[TripResponse])
async def list_trips_for_review(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("REVIEWER", "ADMIN")),
):
    """List all trips available for review."""
    query = select(Trip).order_by(Trip.started_at.desc())
    if status:
        query = query.where(Trip.review_status == status)
    result = await db.execute(query)
    trips = result.scalars().all()
    return [await build_trip_response(db, t) for t in trips]


@router.get("/trips/{trip_id}/clips", response_model=list[ClipResponse])
async def get_trip_clips_for_review(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("REVIEWER", "ADMIN")),
):
    """Get all clips for a trip for reviewer."""
    result = await db.execute(
        select(Clip).where(Clip.trip_id == trip_id).order_by(Clip.video_offset_ms)
    )
    clips = result.scalars().all()
    return [ClipResponse.model_validate(c) for c in clips]


@router.post("/clips/{clip_id}/review", response_model=ReviewResponse)
async def submit_review_decision(
    clip_id: str,
    data: ReviewDecision,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("REVIEWER", "ADMIN")),
):
    """Submit a review decision for a clip."""
    clip = await update_clip_review(db, clip_id, user.id, data.decision, data.note)
    return ReviewResponse(
        clip_id=clip.id,
        review_status=clip.review_status,
        fine_status=clip.fine_status,
    )


@router.post("/clips/{clip_id}/rerun-ai")
async def rerun_ai_analysis(
    clip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("REVIEWER", "ADMIN")),
):
    """Re-queue the AI analysis Celery task for a clip."""
    from app.clips.service import get_clip
    from app.workers.ai_analysis_task import ai_analysis_task
    await get_clip(db, clip_id)  # validate clip exists
    task = ai_analysis_task.delay(clip_id)
    return {"clip_id": clip_id, "task_id": task.id, "status": "queued"}


# === Officer Endpoints ===

@router.get("/fines/queue", response_model=list[ClipResponse])
async def get_fine_queue(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("OFFICER", "ADMIN")),
):
    """Get all confirmed clips awaiting fine issuance."""
    result = await db.execute(
        select(Clip).where(
            Clip.review_status == "CONFIRMED",
            Clip.fine_status == "QUEUED",
        )
    )
    clips = result.scalars().all()
    return [ClipResponse.model_validate(c) for c in clips]


@router.post("/fines/issue", response_model=FineResponse, status_code=201)
async def issue_fine_portal(
    data: FineIssuePortalRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("OFFICER", "ADMIN")),
):
    """Issue a fine from the officer portal queue."""
    fine = await issue_fine(
        db, data.clip_id, user.id,
        data.license_plate, data.violation_type, data.fine_amount, data.notes,
    )
    return FineResponse.model_validate(fine)


# === Admin Endpoints ===

@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("ADMIN")),
):
    """List all registered users (Admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]

