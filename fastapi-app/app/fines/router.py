"""
Drishti-Path — Fine Router
"""
from __future__ import annotations
from typing import Optional

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.auth.service import require_role
from app.auth.models import User
from app.fines import service

router = APIRouter()


class FineIssueRequest(BaseModel):
    license_plate: str
    violation_type: str
    fine_amount: int
    currency: str = "INR"
    notes: Optional[str] = None


class FineResponse(BaseModel):
    id: str
    clip_id: str
    trip_id: str
    user_id: str
    issued_by: str
    license_plate: str
    violation_type: str
    fine_amount: int
    currency: str
    notes: Optional[str]
    issued_at: datetime
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("/{clip_id}/issue", response_model=FineResponse, status_code=201)
async def issue_fine(
    clip_id: str,
    data: FineIssueRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("OFFICER", "ADMIN")),
):
    fine = await service.issue_fine(
        db, clip_id, user.id,
        data.license_plate, data.violation_type, data.fine_amount, data.notes,
    )
    return FineResponse.model_validate(fine)


@router.get("/", response_model=list[FineResponse])
async def list_fines(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("OFFICER", "ADMIN")),
):
    fines = await service.list_fines(db, status)
    return [FineResponse.model_validate(f) for f in fines]


@router.get("/{fine_id}", response_model=FineResponse)
async def get_fine(
    fine_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("OFFICER", "ADMIN")),
):
    fine = await service.get_fine(db, fine_id)
    return FineResponse.model_validate(fine)
