import asyncio
import os
import uuid
import urllib.request
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.database import async_session
from app.auth.models import User
from app.trips.models import Trip
from app.clips.models import Clip

async def main():
    storage_dir = "storage_volume"
    os.makedirs(storage_dir, exist_ok=True)
    os.makedirs(os.path.join(storage_dir, "clips"), exist_ok=True)
    
    sample_mp4 = "sample.mp4"
    if not os.path.exists(sample_mp4):
        urllib.request.urlretrieve("https://www.w3schools.com/html/mov_bbb.mp4", sample_mp4)
        
    async with async_session() as session:
        result = await session.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        if not user:
            print("No users in DB")
            return
            
        trip_id = f"trip-{uuid.uuid4().hex[:8]}"
        trip = Trip(
            id=trip_id,
            user_id=user.id,
            started_at=datetime.utcnow(),
            status="UPLOADED",
            review_status="PENDING",
            device_model="Pixel 8 Pro",
            total_clips=1
        )
        session.add(trip)
        await session.flush()
        
        clip_id = f"clip-{uuid.uuid4().hex[:8]}"
        storage_path = f"clips/{trip_id}/{clip_id}.mp4"
        
        os.makedirs(os.path.join(storage_dir, "clips", trip_id), exist_ok=True)
        with open(sample_mp4, "rb") as src, open(os.path.join(storage_dir, storage_path), "wb") as dst:
            dst.write(src.read())
            
        clip = Clip(
            id=clip_id,
            trip_id=trip_id,
            user_id=user.id,
            storage_path=storage_path,
            timestamp_source="AI",
            ai_server_label="RIGHT",
            video_offset_ms=1000,
            clip_duration_ms=10000,
            review_status="PENDING",
            fine_status="NONE",
            created_at=datetime.utcnow()
        )
        session.add(clip)
        
        await session.commit()
        print(f"Mock trip {trip_id} and clip {clip_id} created successfully!")

if __name__ == "__main__":
    asyncio.run(main())
