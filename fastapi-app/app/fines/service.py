"""
Drishti-Path — Fine Service
"""
from __future__ import annotations
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.fines.models import Fine
from app.clips.models import Clip


async def issue_fine(
    db: AsyncSession,
    clip_id: str,
    officer_id: str,
    license_plate: str,
    violation_type: str,
    fine_amount: int,
    notes: Optional[str] = None,
) -> Fine:
    # Get the clip
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found.")
    if clip.review_status != "CONFIRMED":
        raise HTTPException(status_code=400, detail="Clip must be confirmed before issuing a fine.")

    fine = Fine(
        clip_id=clip_id,
        trip_id=clip.trip_id,
        user_id=clip.user_id,
        issued_by=officer_id,
        license_plate=license_plate,
        violation_type=violation_type,
        fine_amount=fine_amount,
        notes=notes,
    )
    db.add(fine)

    # Update clip fine status
    clip.fine_status = "ISSUED"
    await db.flush()
    return fine


async def list_fines(db: AsyncSession, status: Optional[str] = None) -> list[Fine]:
    query = select(Fine).order_by(Fine.issued_at.desc())
    if status:
        query = query.where(Fine.status == status)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_fine(db: AsyncSession, fine_id: str) -> Fine:
    result = await db.execute(select(Fine).where(Fine.id == fine_id))
    fine = result.scalar_one_or_none()
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found.")
    return fine
