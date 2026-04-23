"""
Drishti-Path — Clip Router
"""
from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.service import get_current_user
from app.auth.models import User
from app.clips.schemas import ClipUploadMetadata, ClipResponse, ClipUploadResponse
from app.clips import service
from app.trips import service as trip_service
from app.storage.s3_client import get_s3_client
from app.workers.ai_analysis_task import ai_analysis_task

router = APIRouter()


@router.post("/upload", response_model=ClipUploadResponse, status_code=201)
async def upload_clip(
    file: UploadFile = File(...),
    metadata: str = Form(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    meta = ClipUploadMetadata.model_validate_json(metadata)

    # Validate trip belongs to user
    await trip_service.get_trip(db, meta.trip_id, user.id)

    # Read binary file
    file_bytes = await file.read()
    s3_client = get_s3_client()
    key = f"clips/{meta.trip_id}/{meta.clip_id or 'auto'}.mp4"
    
    # Upload to storage
    storage_path = await s3_client.upload_file(file_bytes, key, file.content_type or "video/mp4")

    clip = await service.create_clip(db, user.id, meta, storage_path)
    # Flush pushes the INSERT; refresh ensures the ORM object reflects any DB-generated values
    await db.refresh(clip)

    # Queue AI analysis task
    ai_analysis_task.delay(str(clip.id))

    return ClipUploadResponse(clip_id=str(clip.id))


@router.get("/trip/{trip_id}", response_model=list[ClipResponse])
async def list_clips(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    clips = await service.list_clips_for_trip(db, trip_id)
    return [ClipResponse.model_validate(c) for c in clips]


@router.get("/{clip_id}", response_model=ClipResponse)
async def get_clip(
    clip_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    clip = await service.get_clip(db, clip_id)
    return ClipResponse.model_validate(clip)
