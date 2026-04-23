"""
Drishti-Path — Clip Service
"""
from __future__ import annotations
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.clips.models import Clip
from app.clips.schemas import ClipUploadMetadata


async def create_clip(db: AsyncSession, user_id: str, meta: ClipUploadMetadata, storage_path: str) -> Clip:
    clip = Clip(
        id=meta.clip_id or None,
        trip_id=meta.trip_id,
        user_id=user_id,
        storage_path=storage_path,
        timestamp_source=meta.timestamp_source,
        ai_device_confidence=meta.ai_confidence,
        gps_lat=meta.gps.get("lat") if meta.gps else None,
        gps_lng=meta.gps.get("lng") if meta.gps else None,
        recorded_at=meta.recorded_at,
        video_offset_ms=meta.video_offset_ms,
        clip_duration_ms=meta.clip_duration_ms,
    )
    db.add(clip)
    await db.flush()
    return clip


async def get_clip(db: AsyncSession, clip_id: str) -> Clip:
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found.")
    return clip


async def list_clips_for_trip(db: AsyncSession, trip_id: str) -> list[Clip]:
    result = await db.execute(
        select(Clip).where(Clip.trip_id == trip_id).order_by(Clip.video_offset_ms)
    )
    return list(result.scalars().all())


async def update_clip_review(
    db: AsyncSession, clip_id: str, reviewer_id: str,
    decision: str, note: Optional[str] = None,
) -> Clip:
    from datetime import datetime
    clip = await get_clip(db, clip_id)
    clip.review_status = decision
    clip.reviewed_by = reviewer_id
    clip.reviewed_at = datetime.utcnow()
    clip.review_note = note
    if decision == "CONFIRMED":
        clip.fine_status = "QUEUED"
    await db.flush()
    return clip
