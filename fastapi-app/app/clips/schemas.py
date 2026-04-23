"""
Drishti-Path — Clip Schemas
"""
from __future__ import annotations
from typing import Optional

from datetime import datetime
from pydantic import BaseModel, computed_field


class ClipUploadMetadata(BaseModel):
    clip_id: Optional[str] = None
    trip_id: str
    timestamp_source: str  # AI | VOICE | MANUAL
    ai_confidence: Optional[float] = None
    video_offset_ms: Optional[int] = None
    clip_duration_ms: Optional[int] = None
    gps: Optional[dict] = None
    recorded_at: Optional[datetime] = None
    device_model: Optional[str] = None
    android_version: Optional[str] = None
    app_version: Optional[str] = None


class ClipResponse(BaseModel):
    id: str
    trip_id: str
    user_id: str
    storage_path: Optional[str]
    thumbnail_path: Optional[str]
    timestamp_source: str
    ai_device_confidence: Optional[float]
    ai_server_confidence: Optional[float]
    ai_server_label: Optional[str]
    ai_evidence_frames: Optional[str] = None  # Raw JSON string from DB
    gps_lat: Optional[float]
    gps_lng: Optional[float]
    recorded_at: Optional[datetime]
    video_offset_ms: Optional[int]
    clip_duration_ms: Optional[int]
    review_status: str
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    review_note: Optional[str]
    fine_status: str
    created_at: datetime

    @computed_field
    @property
    def video_url(self) -> Optional[str]:
        if self.storage_path:
            path = self.storage_path.replace("\\", "/")
            return f"http://localhost:8000/storage/{path}"
        return None

    @computed_field
    @property
    def thumbnail_url(self) -> Optional[str]:
        if self.thumbnail_path:
            path = self.thumbnail_path.replace("\\", "/")
            return f"http://localhost:8000/storage/{path}"
        return None

    @computed_field
    @property
    def evidence_frames_list(self) -> list:
        """Parse the JSON string stored in ai_evidence_frames into a Python list."""
        import json
        if self.ai_evidence_frames:
            try:
                return json.loads(self.ai_evidence_frames)
            except Exception:
                return []
        return []

    model_config = {
        "from_attributes": True,
    }


class ClipUploadResponse(BaseModel):
    clip_id: str
    status: str = "queued"
    ai_analysis_eta_seconds: int = 45
