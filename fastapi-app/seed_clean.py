#!/usr/bin/env python3
"""
Drishti-Path — Clean DB Reset + Real Sample Video Seed
Wipes all test garbage, then seeds one clean trip + clip using test_video_1.mov
"""
import asyncio
import os
import shutil
import uuid
from datetime import datetime

from sqlalchemy import delete, select
from app.database import async_session
# Import ALL models first so SQLAlchemy resolves FK relationships
import app.auth.models
import app.trips.models
import app.clips.models
import app.fines.models
from app.auth.models import User
from app.trips.models import Trip
from app.clips.models import Clip
from app.fines.models import Fine

# ── Config ────────────────────────────────────────────────────────────────────
SAMPLE_VIDEO_SRC = "/Users/nimishkumar/main_dir/Program1/csl/dir/project_1/sample_video_for_webportal/test_video_1.mov"
STORAGE_ROOT     = os.path.join(os.path.dirname(__file__), "storage_volume")

# Seeded real trip already in DB — keep this
KEEP_TRIP_ID     = "trip-8a5a7a96"

# IDs we want to create
REAL_TRIP_ID     = "trip-sample-demo-001"
REAL_CLIP_ID     = "clip-sample-demo-001"

DRIVER_USER_ID   = "0d209f56-4de0-4e7e-8706-c57a95ce308a"   # nikhil@example.com


async def clean_and_seed():
    async with async_session() as db:

        # ── 1. Delete all fake test fines ────────────────────────────────────
        print("🗑  Deleting test fines...")
        await db.execute(delete(Fine))
        print("   ✓ All fines cleared")

        # ── 2. Delete test clips (keep the seeded one) ───────────────────────
        print("🗑  Deleting test clips...")
        await db.execute(
            delete(Clip).where(Clip.trip_id != KEEP_TRIP_ID)
        )
        print("   ✓ Garbage clips deleted")

        # ── 3. Delete test trips (keep the seeded one + create a fresh one) ──
        print("🗑  Deleting garbage trips...")
        garbage_ids = [
            "diag-trip-001",
            "560c91f2-e56a-48e0-acf7-0edba05799aa",
            "test-trip-c49b2031",
            "test-trip-c978c45e",
            "0b870ba9-5570-497f-b51e-a3e1feb4c80c",
        ]
        await db.execute(
            delete(Trip).where(
                Trip.id.notin_([KEEP_TRIP_ID, REAL_TRIP_ID])
            )
        )
        print("   ✓ Garbage trips deleted")

        await db.flush()

        # ── 4. Create the clean demo trip ────────────────────────────────────
        print(f"🚗  Creating real demo trip [{REAL_TRIP_ID}]...")

        # Check if it already exists (idempotent)
        existing = (await db.execute(select(Trip).where(Trip.id == REAL_TRIP_ID))).scalar_one_or_none()
        if not existing:
            new_trip = Trip(
                id=REAL_TRIP_ID,
                user_id=DRIVER_USER_ID,
                started_at=datetime(2026, 4, 19, 7, 30, 0),
                ended_at=datetime(2026, 4, 19, 8, 15, 0),
                status="UPLOADED",
                review_status="PENDING",
                gps_start_lat=28.6139,
                gps_start_lng=77.2090,
                device_model="OnePlus 12R (Demo)",
                android_version="14",
                app_version="1.0.0",
                total_clips=1,
                total_ai_flags=1,
                total_voice_flags=0,
                total_manual_flags=0,
            )
            db.add(new_trip)
            await db.flush()
            print(f"   ✓ Trip created")
        else:
            print(f"   ✓ Trip already exists, skipping")

        # ── 5. Copy the sample video to storage_volume ───────────────────────
        print(f"📁  Copying test_video_1.mov to storage_volume...")
        dest_dir  = os.path.join(STORAGE_ROOT, "clips", REAL_TRIP_ID)
        dest_file = os.path.join(dest_dir, f"{REAL_CLIP_ID}.mp4")
        os.makedirs(dest_dir, exist_ok=True)

        if not os.path.exists(dest_file):
            shutil.copy2(SAMPLE_VIDEO_SRC, dest_file)
            print(f"   ✓ Copied → {dest_file}")
        else:
            print(f"   ✓ File already in place at {dest_file}")

        # ── 6. Register the clip in DB ────────────────────────────────────────
        print(f"🎬  Registering clip [{REAL_CLIP_ID}] in DB...")
        existing_clip = (await db.execute(select(Clip).where(Clip.id == REAL_CLIP_ID))).scalar_one_or_none()
        if not existing_clip:
            storage_key = f"clips/{REAL_TRIP_ID}/{REAL_CLIP_ID}.mp4"
            new_clip = Clip(
                id=REAL_CLIP_ID,
                trip_id=REAL_TRIP_ID,
                user_id=DRIVER_USER_ID,
                storage_path=storage_key,
                thumbnail_path=None,
                timestamp_source="AI",
                ai_device_confidence=0.82,
                ai_server_confidence=0.88,
                ai_server_label="RIGHT",
                ai_evidence_frames=None,
                gps_lat=28.6139,
                gps_lng=77.2090,
                recorded_at=datetime(2026, 4, 19, 7, 43, 11),
                video_offset_ms=793000,       # ~13 minutes into trip
                clip_duration_ms=20000,       # 20 seconds
                review_status="PENDING",
                fine_status="NONE",
            )
            db.add(new_clip)
            await db.flush()
            print(f"   ✓ Clip registered, status=PENDING")
        else:
            print(f"   ✓ Clip already registered")

        # ── 7. Commit everything ──────────────────────────────────────────────
        await db.commit()

    # ── 8. Quick verification ─────────────────────────────────────────────────
    async with async_session() as db:
        from sqlalchemy import func
        trips = (await db.execute(select(Trip))).scalars().all()
        clips = (await db.execute(select(Clip))).scalars().all()
        fines = (await db.execute(select(Fine))).scalars().all()

        print("\n✅  DATABASE STATE AFTER SEED")
        print(f"   Trips ({len(trips)}):")
        for t in trips:
            print(f"     [{t.id}] status={t.status} device={t.device_model}")
        print(f"   Clips ({len(clips)}):")
        for c in clips:
            print(f"     [{c.id}] trip={c.trip_id} review={c.review_status}")
            print(f"              url=http://localhost:8000/storage/{c.storage_path}")
        print(f"   Fines ({len(fines)}): {'none' if not fines else [f.id for f in fines]}")

        # Verify the file exists
        demo_file = os.path.join(STORAGE_ROOT, "clips", REAL_TRIP_ID, f"{REAL_CLIP_ID}.mp4")
        print(f"\n   Video file on disk: {'✅ EXISTS' if os.path.exists(demo_file) else '❌ MISSING'} → {demo_file}")

        video_url = f"http://localhost:8000/storage/clips/{REAL_TRIP_ID}/{REAL_CLIP_ID}.mp4"
        print(f"   Portal video URL: {video_url}")
        print(f"\n👆  Open the portal at http://localhost:3000 and log in as palak@example.com / password123")
        print(f"   Go to Trips → click the 'OnePlus 12R (Demo)' trip → you will see the sample video\n")


if __name__ == "__main__":
    asyncio.run(clean_and_seed())
