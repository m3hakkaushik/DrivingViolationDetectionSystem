# Drishti-Path — System Architecture
**Document 2 of 2 — Technical System Specification**
*Internal Use Only — v1.0.0*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Mobile App Architecture](#3-mobile-app-architecture)
4. [On-Device AI Architecture](#4-on-device-ai-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schemas](#6-database-schemas)
7. [Web Portal Architecture](#7-web-portal-architecture)
8. [Screen-by-Screen Specifications](#8-screen-by-screen-specifications)
9. [Data Contracts](#9-data-contracts)
10. [User Flows](#10-user-flows)
11. [Error States](#11-error-states)
12. [Development Conventions](#12-development-conventions)

---

## 1. Project Overview

### 1.1 Product Ecosystem

Drishti-Path is a three-layer system:

| Layer | Technology | Responsibility |
|---|---|---|
| **Mobile App** | Flutter 3.x (Dart) + Kotlin bridge | Record video, AI flag lane changes, collect timestamps, clip + upload |
| **Backend** | FastAPI (Python) + PostgreSQL + S3 | Receive uploads, run server AI, serve portal data, manage fine records |
| **Web Portal** | Next.js (React) | Reviewer confirms/rejects clips; officer issues fines |

### 1.2 What the System Does NOT Do

- Does not issue fines automatically — human in the loop always
- Does not detect turn signals in v1 — lane-change trajectory only
- Does not stream video — everything is post-trip batch processing
- Does not support iOS in v1 — Android only

### 1.3 Key Design Decisions

| Decision | Rationale |
|---|---|
| On-device AI is a rough filter (75–80%) | False positives acceptable; humans review before any action |
| Video stays on device until WiFi available | Avoid mobile data costs; large files (60MB/min) |
| 5-minute video chunking | Limits data loss if app crashes mid-trip |
| Three timestamp sources (AI, voice, manual) | No single source is reliable enough alone |
| ffmpeg_kit_flutter for clipping | Avoids re-encoding; copy-only extraction preserves quality |
| Signed URLs (1hr expiry) for video serving | Violation footage is sensitive; never publicly accessible |

---

## 2. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FLUTTER APP                                  │
│                                                                      │
│  ┌─────────────┐   ┌──────────────────┐   ┌─────────────────────┐  │
│  │  CameraX    │   │  Dart Isolate    │   │  Kotlin Bridge      │  │
│  │  (camera    │──►│  YOLOv8-nano     │   │  SpeechRecognizer   │  │
│  │   plugin)   │   │  tflite_flutter  │   │  "mark" keyword     │  │
│  │  1080p@30fps│   │  10 FPS sampling │   │  MethodChannel      │  │
│  └──────┬──────┘   └────────┬─────────┘   └──────────┬──────────┘  │
│         │                   │                          │             │
│         ▼                   ▼                          ▼             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Timestamp Event Manager (Riverpod)             │    │
│  │   AI flags + Voice marks + Manual taps → TimestampEvent[]  │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │                                       │
│                    Trip ends │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Post-Trip Processor                            │    │
│  │   ffmpeg_kit_flutter → clips (±10s per timestamp)          │    │
│  │   Thumbnail extraction → JPEG per clip                     │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Drift (SQLite) Local DB                        │    │
│  │   trips | timestamp_events | violation_clips                │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │ WiFi detected                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              flutter_foreground_task Upload Worker          │    │
│  │   dio multipart upload → exponential backoff retry         │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
└──────────────────────────────┼───────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                              │
│                                                                      │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────────┐  │
│  │  Auth Layer  │  │  Upload API     │  │  Portal API           │  │
│  │  JWT + OAuth │  │  /api/clips/    │  │  /api/portal/         │  │
│  │              │  │  upload         │  │  trips + fines        │  │
│  └──────────────┘  └────────┬────────┘  └───────────────────────┘  │
│                             │                                        │
│                    ┌────────▼────────┐                              │
│                    │  AI Worker      │                              │
│                    │  YOLOv8-small   │                              │
│                    │  async queue    │                              │
│                    └────────┬────────┘                              │
│                             │                                        │
│  ┌─────────────────┐        │         ┌──────────────────────────┐  │
│  │  PostgreSQL DB  │◄───────┴────────►│  S3-compatible Storage   │  │
│  │  users/trips/   │                  │  clips + thumbnails      │  │
│  │  clips/fines    │                  │  signed URL (1hr expiry) │  │
│  └─────────────────┘                  └──────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS WEB PORTAL                           │
│                                                                      │
│  Reviewer Role          │         Officer Role                       │
│  ─────────────────      │         ─────────────────                  │
│  Trips queue            │         Fine queue                         │
│  Clip viewer            │         Fine issuance form                 │
│  Confirm / Reject       │         License plate entry                │
│                         │         Fine status tracking               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mobile App Architecture

### 3.1 Tech Stack

| Concern | Package | Version |
|---|---|---|
| Framework | Flutter | 3.x (Dart 3.x) |
| State management | `riverpod` | ^2.4.x |
| Navigation | `go_router` | ^12.x |
| Camera | `camera` | ^0.10.x |
| ML Inference | `tflite_flutter` | ^0.10.x |
| Background tasks | `flutter_foreground_task` | ^6.x |
| Local database | `drift` | ^2.x |
| HTTP client | `dio` | ^5.x |
| Video playback | `video_player` | ^2.x |
| Video clipping | `ffmpeg_kit_flutter` | ^6.x |
| GPS | `geolocator` | ^10.x |
| WiFi detection | `connectivity_plus` | ^5.x |
| Voice bridge | Kotlin `MethodChannel` | — |
| SVG assets | `flutter_svg` | ^2.x |
| Google Fonts | `google_fonts` | ^6.x |
| Animations | `flutter_animate` | ^4.x |

### 3.2 State Management Architecture (Riverpod)

```
Providers
├── authProvider               → AuthState (unauthenticated | authenticated)
├── tripRecordingProvider      → TripRecordingState (idle | recording | ending)
├── timestampProvider          → List<TimestampEvent> (live stream)
├── aiDetectionProvider        → AiDetectionState (running | throttled | disabled)
├── voiceListenerProvider      → VoiceState (listening | paused | unavailable)
├── tripReviewProvider(tripId) → TripReviewState (loaded | processing | uploading)
├── tripHistoryProvider        → List<Trip> (from Drift DB)
└── uploadQueueProvider        → UploadQueueState (idle | uploading | failed)
```

### 3.3 Navigation Structure (go_router)

```
/                           → HomeScreen
├── /trip/active            → ActiveTripScreen
├── /trip/:tripId/review    → TripReviewScreen
├── /trip/:tripId/clips     → ClipListScreen
├── /trips                  → TripHistoryScreen
├── /settings               → SettingsScreen
├── /auth/login             → LoginScreen
├── /auth/register          → RegisterScreen
└── /onboarding             → OnboardingScreen (first launch only)
```

### 3.4 Folder Structure

```
lib/
├── main.dart
├── app.dart                    # GoRouter + ProviderScope setup
├── core/
│   ├── constants/
│   │   ├── colors.dart         # All brand color tokens
│   │   ├── typography.dart     # TextStyle definitions
│   │   └── dimensions.dart     # Spacing, radius tokens
│   ├── theme/
│   │   └── app_theme.dart      # ThemeData
│   └── utils/
│       ├── date_format.dart
│       └── file_utils.dart
├── data/
│   ├── database/
│   │   ├── app_database.dart   # Drift DB definition
│   │   ├── tables/
│   │   │   ├── trips_table.dart
│   │   │   ├── timestamp_events_table.dart
│   │   │   └── violation_clips_table.dart
│   │   └── daos/
│   │       ├── trips_dao.dart
│   │       ├── timestamps_dao.dart
│   │       └── clips_dao.dart
│   ├── models/
│   │   ├── trip.dart
│   │   ├── timestamp_event.dart
│   │   └── violation_clip.dart
│   ├── repositories/
│   │   ├── trip_repository.dart
│   │   └── upload_repository.dart
│   └── remote/
│       ├── api_client.dart     # dio setup
│       └── endpoints.dart
├── domain/
│   ├── ai/
│   │   ├── yolo_detector.dart      # tflite_flutter wrapper
│   │   ├── centroid_tracker.dart   # in-memory vehicle tracking
│   │   └── lane_change_detector.dart
│   ├── voice/
│   │   └── voice_bridge.dart       # MethodChannel wrapper
│   ├── recording/
│   │   ├── recording_service.dart
│   │   └── clip_processor.dart     # ffmpeg_kit_flutter
│   └── upload/
│       └── upload_service.dart
├── presentation/
│   ├── screens/
│   │   ├── home/
│   │   ├── active_trip/
│   │   ├── trip_review/
│   │   ├── trip_history/
│   │   ├── settings/
│   │   ├── auth/
│   │   └── onboarding/
│   ├── widgets/
│   │   ├── gradient_button.dart
│   │   ├── glass_card.dart
│   │   ├── confidence_badge.dart
│   │   ├── timestamp_marker.dart
│   │   └── orb_background.dart
│   └── providers/
│       └── (all riverpod providers)
└── android/
    └── app/src/main/kotlin/
        └── VoiceBridgePlugin.kt    # Kotlin MethodChannel
```

### 3.5 Local Storage Strategy

| Data Type | Storage | Retention |
|---|---|---|
| Trip metadata | Drift (SQLite) | Forever (until user deletes) |
| Timestamp events | Drift (SQLite) | With parent trip |
| Violation clip metadata | Drift (SQLite) | With parent trip |
| Video chunks (.mp4) | App file storage | 7 days post-upload |
| Clip files (.mp4) | App file storage | 7 days post-upload |
| Thumbnails (.jpg) | App file storage | 7 days post-upload |
| Auth token (JWT) | `flutter_secure_storage` | Until logout |
| User preferences | `shared_preferences` | Forever |

### 3.6 Android Permissions Required

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

---

## 4. On-Device AI Architecture

### 4.1 Model Specification

| Property | Value |
|---|---|
| Model | YOLOv8-nano |
| Export format | TFLite INT8 quantized |
| File name | `yolov8n_vehicles_int8.tflite` |
| Input tensor | `[1, 360, 640, 3]` float32 (normalised 0–1) |
| Output tensor | `[1, 25200, 9]` (boxes + confidence + 4 vehicle classes) |
| Classes | `0:car, 1:truck, 2:bus, 3:motorcycle` |
| Model size | ~3.2 MB (INT8) |
| Delegate | `GpuDelegateV2` → NNAPI fallback → CPU |

### 4.2 Inference Pipeline (Dart Isolate)

```dart
// Runs in a separate Dart isolate — never on UI thread
class YoloDetector {
  late Interpreter _interpreter;
  static const int inputWidth = 640;
  static const int inputHeight = 360;

  Future<void> initialize() async {
    final options = InterpreterOptions()
      ..addDelegate(GpuDelegateV2());
    _interpreter = await Interpreter.fromAsset(
      'assets/models/yolov8n_vehicles_int8.tflite',
      options: options,
    );
  }

  List<Detection> detect(CameraImage frame) {
    final input = _preprocessFrame(frame);    // YUV420 → RGB → normalise → reshape
    final output = List.filled(1 * 25200 * 9, 0.0).reshape([1, 25200, 9]);
    _interpreter.run(input, output);
    return _postprocess(output);              // NMS → filter by confidence > 0.45
  }
}
```

### 4.3 Centroid Tracker

```dart
class CentroidTracker {
  final Map<String, VehicleTrack> _tracks = {};
  static const int maxMissedFrames = 10;
  static const int frameWindow = 45;         // 1.5s at 30 FPS
  static const double lateralThreshold = 0.12;
  static const double minBoxArea = 0.03;
  static const int cooldownMs = 8000;

  List<LaneChangeEvent> update(List<Detection> detections, int frameTimeMs) {
    _matchDetectionsToTracks(detections);
    _pruneStaleTrackers(frameTimeMs);
    return _checkLaneChanges(frameTimeMs);
  }

  List<LaneChangeEvent> _checkLaneChanges(int frameTimeMs) {
    final events = <LaneChangeEvent>[];
    for (final track in _tracks.values) {
      if (track.positions.length < frameWindow) continue;
      if (track.boxArea < minBoxArea) continue;
      if (frameTimeMs - track.lastFlagTimeMs < cooldownMs) continue;

      final xStart = track.positions[track.positions.length - frameWindow].dx;
      final xEnd = track.positions.last.dx;
      final delta = (xEnd - xStart).abs();

      if (delta > lateralThreshold) {
        track.lastFlagTimeMs = frameTimeMs;
        events.add(LaneChangeEvent(
          trackId: track.id,
          direction: xEnd > xStart ? 'RIGHT' : 'LEFT',
          confidence: _computeConfidence(track),
          frameTimeMs: frameTimeMs,
        ));
      }
    }
    return events;
  }
}
```

### 4.4 Frame Sampling Strategy

```dart
// In FrameAnalyzerService
int _frameCount = 0;
static const int sampleEveryN = 3; // 10 FPS at 30 FPS input

void onFrame(CameraImage image) {
  _frameCount++;
  if (_frameCount % sampleEveryN != 0) return;
  // send to isolate for inference
  _isolateSendPort.send(image);
}
```

### 4.5 Thermal Management

```dart
// Monitor via platform channel
void _startThermalMonitor() {
  const channel = MethodChannel('drishti_path/thermal');
  channel.setMethodCallHandler((call) async {
    if (call.method == 'onThermalStatusChange') {
      final status = call.arguments as String;
      if (status == 'SEVERE' || status == 'CRITICAL') {
        // double the skip interval: 10fps → 5fps
        _sampleEveryN = 6;
        ref.read(aiDetectionProvider.notifier).setThrottled(true);
      } else {
        _sampleEveryN = 3;
        ref.read(aiDetectionProvider.notifier).setThrottled(false);
      }
    }
  });
}
```

---

## 5. Backend Architecture

### 5.1 Stack

| Component | Technology | Notes |
|---|---|---|
| API framework | FastAPI (Python 3.11+) | Async, auto-docs, Pydantic validation |
| Database | PostgreSQL 15 | Primary data store |
| ORM | SQLAlchemy 2.x + Alembic | Async ORM; Alembic migrations |
| Object storage | S3-compatible (AWS S3 / Supabase Storage / MinIO) | Clips + thumbnails |
| Task queue | Celery + Redis | AI worker queue |
| Auth | JWT (python-jose) + bcrypt | Stateless auth |
| Server | Uvicorn + Gunicorn | Production ASGI |
| Container | Docker + Docker Compose | Local dev; deploy to Railway/Render/AWS |

### 5.2 Service Map

```
fastapi-app/
├── app/
│   ├── main.py                  # FastAPI app init, router inclusion
│   ├── config.py                # Settings via pydantic-settings (.env)
│   ├── database.py              # Async SQLAlchemy engine
│   ├── auth/
│   │   ├── router.py            # /api/auth/*
│   │   ├── service.py
│   │   └── schemas.py
│   ├── trips/
│   │   ├── router.py            # /api/trips/*
│   │   ├── service.py
│   │   ├── models.py            # SQLAlchemy models
│   │   └── schemas.py           # Pydantic in/out
│   ├── clips/
│   │   ├── router.py            # /api/clips/*
│   │   ├── service.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── portal/
│   │   ├── router.py            # /api/portal/*
│   │   ├── reviewer_service.py
│   │   └── officer_service.py
│   ├── fines/
│   │   ├── router.py
│   │   ├── service.py
│   │   └── models.py
│   ├── storage/
│   │   └── s3_client.py         # boto3 wrapper; signed URL generation
│   └── workers/
│       ├── celery_app.py        # Celery init
│       └── ai_analysis_task.py  # YOLOv8-small inference on clips
├── alembic/                     # DB migrations
├── tests/
├── Dockerfile
└── docker-compose.yml
```

### 5.3 Authentication

- **Mechanism:** JWT Bearer tokens
- **Access token expiry:** 1 hour
- **Refresh token expiry:** 30 days (stored in HttpOnly cookie)
- **Password hashing:** bcrypt (12 rounds)
- **Role field** on user record: `DRIVER | REVIEWER | OFFICER | ADMIN`
- **Route guards:** FastAPI `Depends(get_current_user)` + role check decorator

```python
# Role guard dependency
def require_role(*roles: str):
    async def _check(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return _check

# Usage
@router.get("/portal/fines/queue")
async def get_fine_queue(user = Depends(require_role("OFFICER", "ADMIN"))):
    ...
```

### 5.4 Upload API — Clip Ingestion

```python
@router.post("/clips/upload")
async def upload_clip(
    file: UploadFile = File(...),
    metadata: str = Form(...),           # JSON string
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    storage: S3Client = Depends(get_storage),
):
    meta = ClipUploadMetadata.model_validate_json(metadata)

    # 1. Validate trip belongs to user
    trip = await trips_service.get_trip(db, meta.trip_id, current_user.id)

    # 2. Upload to S3
    storage_path = f"clips/{meta.trip_id}/{meta.clip_id}.mp4"
    await storage.upload_file(file, storage_path)

    # 3. Write clip record
    clip = await clips_service.create_clip(db, meta, storage_path)

    # 4. Queue AI analysis
    ai_analysis_task.delay(str(clip.id))

    return {"clip_id": str(clip.id), "status": "queued"}
```

### 5.5 AI Worker (Celery Task)

```python
@celery_app.task(bind=True, max_retries=3)
def ai_analysis_task(self, clip_id: str):
    try:
        # 1. Fetch clip record
        clip = sync_db.query(Clip).filter(Clip.id == clip_id).first()

        # 2. Download from S3
        local_path = storage.download_temp(clip.storage_path)

        # 3. Run YOLOv8-small inference
        result = run_lane_change_analysis(local_path)
        # result = {
        #   confirmed: bool,
        #   confidence: float,
        #   direction: str,
        #   evidence_frames: list[dict]
        # }

        # 4. Write results
        clip.ai_server_confidence = result["confidence"]
        clip.ai_server_label = result["direction"]
        clip.ai_evidence_frames = json.dumps(result["evidence_frames"])
        sync_db.commit()

        # 5. Cleanup temp file
        os.unlink(local_path)

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))
```

### 5.6 Signed URL Generation

```python
# 1-hour expiry; never expose permanent S3 URLs
def get_signed_url(storage_path: str, expiry_seconds: int = 3600) -> str:
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": storage_path},
        ExpiresIn=expiry_seconds,
    )
```

---

## 6. Database Schemas

### 6.1 users

```json
{
  "id": "uuid",
  "email": "mehak@example.com",
  "password_hash": "$2b$12$...",
  "name": "Mehak",
  "role": "DRIVER",
  "is_active": true,
  "created_at": "2025-03-19T10:00:00Z",
  "updated_at": "2025-03-19T10:00:00Z"
}
```

### 6.2 trips

```json
{
  "id": "9e8d7f6a-0001-0000-0000-000000000001",
  "user_id": "uuid",
  "started_at": "2025-03-19T08:30:00Z",
  "ended_at": "2025-03-19T09:15:00Z",
  "duration_ms": 2700000,
  "status": "UPLOADED",
  "gps_start_lat": 28.4595,
  "gps_start_lng": 77.0266,
  "device_model": "Pixel 7",
  "android_version": "14",
  "app_version": "1.0.0",
  "total_clips": 6,
  "total_ai_flags": 4,
  "total_voice_flags": 1,
  "total_manual_flags": 1,
  "uploaded_at": "2025-03-19T09:30:00Z",
  "review_status": "PENDING",
  "created_at": "2025-03-19T08:30:00Z"
}
```

### 6.3 clips

```json
{
  "id": "3f4a1b2c-0001-0000-0000-000000000001",
  "trip_id": "9e8d7f6a-0001-0000-0000-000000000001",
  "user_id": "uuid",
  "storage_path": "clips/9e8d7f6a.../3f4a1b2c....mp4",
  "thumbnail_path": "thumbs/3f4a1b2c....jpg",
  "timestamp_source": "AI",
  "ai_device_confidence": 0.82,
  "ai_server_confidence": 0.88,
  "ai_server_label": "RIGHT",
  "ai_evidence_frames": "[{\"frame_ms\": 14200, \"bbox\": [120, 80, 320, 220]}]",
  "gps_lat": 28.4601,
  "gps_lng": 77.0271,
  "recorded_at": "2025-03-19T08:52:14Z",
  "video_offset_ms": 1334000,
  "clip_duration_ms": 20000,
  "review_status": "PENDING",
  "reviewed_by": null,
  "reviewed_at": null,
  "review_note": null,
  "fine_status": "NONE",
  "created_at": "2025-03-19T09:28:00Z"
}
```

### 6.4 fines

```json
{
  "id": "fine-uuid-0001",
  "clip_id": "3f4a1b2c-0001-0000-0000-000000000001",
  "trip_id": "9e8d7f6a-0001-0000-0000-000000000001",
  "user_id": "uuid",
  "issued_by": "officer-uuid",
  "license_plate": "DL01AB1234",
  "violation_type": "LANE_CHANGE_NO_SIGNAL",
  "fine_amount": 500,
  "currency": "INR",
  "notes": "Right lane change at highway entry, no indicator",
  "issued_at": "2025-03-19T14:00:00Z",
  "status": "ISSUED",
  "created_at": "2025-03-19T14:00:00Z"
}
```

### 6.5 reviewer_decisions (audit log)

```json
{
  "id": "decision-uuid",
  "clip_id": "3f4a1b2c-0001-0000-0000-000000000001",
  "reviewer_id": "reviewer-uuid",
  "decision": "CONFIRMED",
  "reason": null,
  "note": "Clear lane change visible, no signal in 10s window",
  "decided_at": "2025-03-19T13:45:00Z"
}
```

---

## 7. Web Portal Architecture

### 7.1 Stack

| Component | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS vars matching brand tokens |
| State | Zustand |
| Data fetching | TanStack Query (React Query) |
| Video player | `react-player` or native `<video>` |
| Maps | Leaflet.js (lightweight, no Google Maps dependency) |
| Auth | next-auth with JWT backend |
| Hosting | Vercel / Railway |

### 7.2 Portal Route Structure

```
/                          → redirect to /portal/trips
/login                     → LoginPage
/portal/
├── trips                  → TripsQueuePage (Reviewer)
├── trips/[tripId]         → TripDetailPage (Reviewer)
├── fines/
│   ├── queue              → FineQueuePage (Officer)
│   └── history            → FinesHistoryPage (Officer)
└── admin/
    └── users              → UserManagementPage (Admin)
```

### 7.3 Key Portal Components

```
components/
├── ClipPlayer.tsx          # <video> + custom controls + loop
├── ConfidenceBadge.tsx     # Colour-coded AI score pill
├── TripCard.tsx            # Trip list item
├── ReviewDecisionPanel.tsx # Confirm/Reject UI
├── FineIssuanceDrawer.tsx  # Slide-over form for officer
├── GpsMapPin.tsx           # Leaflet map with single pin
└── AiEvidenceOverlay.tsx   # Bounding box overlay on video frame
```

---

## 8. Screen-by-Screen Specifications

---

### Screen 1: Splash

**Route:** Displayed on app cold start (< 1.5s)
**Purpose:** Brand moment; initialise app state

**Layout:**
- Full screen, background: radial gradient `Blossom Pink #F4A7C3` → `Lavender Mist #C9B8F0`
- Centre: Logo mark (eye-road icon), 80dp, white, with glow `FF79C6` 20dp blur
- Below mark: `Drishti-Path` in Playfair Display 700, 28sp, white
- Tagline: "See the road clearly." DM Sans 400, 14sp, white at 75% opacity

**Animations:**
- Logo fades in + scales `0.7 → 1.0` over 600ms `easeOutBack`
- Wordmark fades in 200ms after logo, 400ms duration
- Tagline fades in 200ms after wordmark
- Orb glow pulses once slowly (1200ms cycle)
- Transitions to Home or Onboarding after 1500ms via fade (300ms)

**States:**
- `loading` — shown while checking auth + DB init
- `ready` — triggers navigation

---

### Screen 2: Onboarding

**Route:** `/onboarding` (first launch only; guarded by `shared_preferences` flag)
**Purpose:** Explain core flow in 3 steps; request permissions

**Layout:** Full-screen paged `PageView`, 3 pages

| Page | Illustration | Headline | Body |
|---|---|---|---|
| 1 | Phone on dashboard, road ahead | "Mount. Tap. Drive." | "Drishti-Path watches the road while you focus on driving." |
| 2 | Waveform with "mark" keyword | "Just say 'mark'." | "Spot something? One word drops a timestamp. No hands needed." |
| 3 | Cloud with checkmark | "Review later. Act carefully." | "Every clip goes through human review before anything happens." |

**Components:**
- Page dots indicator (bottom)
- `Next` button (gradient, full-width)
- `Skip` text button (top-right, Ash colour)
- Page 3: `Get Started` replaces `Next`; triggers permission request flow

**Permission request sequence (after "Get Started"):**
1. Camera permission dialog
2. Microphone permission dialog
3. Location permission dialog
4. On all granted → navigate to Register/Login
5. On any denied → show gentle explanation screen with Settings deep-link

---

### Screen 3: Authentication

**Route:** `/auth/login` and `/auth/register`
**Purpose:** User account creation and login

**Login Layout:**
- Top: Logo mark (40dp) + "Welcome back" (heading-xl)
- Email input field
- Password input field (toggle visibility)
- "Forgot password?" text link
- Primary gradient `Log In` button
- Divider: "or"
- "Create an account" ghost button

**Register Layout:**
- Name, email, password, confirm password fields
- Primary `Create Account` button
- "Already have an account? Log in" link

**States:**
- `idle` — empty form
- `loading` — button shows shimmer spinner
- `error` — inline field errors (wrong password, email exists)
- `success` — fade transition to Home

---

### Screen 4: Home

**Route:** `/`
**Purpose:** Central hub — start trip or access history

**Layout:**
```
┌─────────────────────────────────┐
│  [Nav bar: Drishti logo]        │  ← app bar, logo left, settings right
│                                 │
│  ┌─────────────────────────┐   │
│  │  Gradient orb (ambient) │   │  ← decorative, slow pulse
│  │  "Ready to watch?"      │   │  ← heading-xl, Ink
│  │  "Tap below to begin."  │   │  ← body-md, Charcoal
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  [START TRIP]  ← gradient button, full-width     │
│  └─────────────────────────┘   │
│                                 │
│  Recent Trips                   │  ← heading-sm
│  ┌────────────────────────┐    │
│  │ TripCard               │    │  ← staggered entrance
│  │ TripCard               │    │
│  └────────────────────────┘    │
│                                 │
│  [Home] [Trips] [↑] [Settings] │  ← bottom nav
└─────────────────────────────────┘
```

**States:**
- `no_trips` — empty state illustration + "Your first trip will appear here."
- `upload_pending` — sticky amber banner top: "Waiting for WiFi to upload N clips."
- `uploading` — sticky info banner: "Uploading your clips..."
- `storage_low` — bottom snackbar warning

---

### Screen 5: Active Trip

**Route:** `/trip/active`
**Purpose:** Full-screen recording view — minimal UI, maximum road awareness

**Layout:**
```
┌─────────────────────────────────┐
│ ● 00:14:32          [4 flags]  │  ← recording dot (pulse) + AI flag counter
│                                 │
│                                 │
│       [CAMERA PREVIEW]          │  ← full screen CameraPreview widget
│         full screen             │
│                                 │
│  ◉ Listening                   │  ← voice status dot (amber pulse)
│                                 │
│                                 │
│  ████████████  END TRIP         │  ← long-press progress button (bottom center)
└─────────────────────────────────┘
```

**Interactions:**
- Voice "mark" detected → amber radial flash (300ms) over recording dot
- AI flag → counter badge increments with pop animation
- Long-press "END TRIP" → 2-second fill animation → trip stops
- Thermal throttle → subtle "AI slowed" toast (non-blocking)

**States:**
- `recording` — default
- `ending` — long-press progress shown
- `throttled` — voice dot turns grey; AI badge greys out
- `storage_critical` — red banner overlay + auto-stop if < 100MB

---

### Screen 6: Trip Review

**Route:** `/trip/:tripId/review`
**Purpose:** Post-trip review — edit timestamps, initiate processing

**Layout:**
```
┌─────────────────────────────────┐
│ ← Back    Trip Review           │
│                                 │
│  ┌─────────────────────────┐   │
│  │   VIDEO PLAYER          │   │  ← 16:9 aspect ratio
│  │   [▶ / ‖]               │   │
│  │ ▬▬▬●──────────────▬▬▬  │   │  ← scrubber with coloured markers
│  └─────────────────────────┘   │
│  [+ Add Mark at 00:14:32]       │  ← ghost button
│                                 │
│  Timestamps (6)                 │
│  ┌────────────────────────┐    │
│  │ 🤖 AI    14:32  82%  🗑│    │  ← amber badge
│  │ 🎤 Voice 22:18      🗑│    │  ← lavender badge
│  │ ✋ Manual 31:05      🗑│    │  ← peach badge
│  └────────────────────────┘    │
│                                 │
│  [PROCESS 6 CLIPS & UPLOAD]     │  ← gradient button, disabled if 0 timestamps
└─────────────────────────────────┘
```

**States:**
- `idle` — reviewing
- `processing` — progress bar + "Preparing your clips..." copy
- `ready` — "Done. Will upload on WiFi." success banner
- `uploading` — progress indicator per clip

---

### Screen 7: Trip History

**Route:** `/trips`
**Purpose:** All past trips with status tracking

**Layout:**
- Filter tabs: `All | Pending | Reviewed`
- Trip cards in list — date, duration, clip count, status chip
- Pull-to-refresh

**Trip Card:**
```
┌──────────────────────────────┐
│ Tue, 19 Mar • 08:30 AM       │  ← label-md, Ash
│ 45 minutes · 6 clips         │  ← body-sm
│                [Uploaded ✓]  │  ← success badge
└──────────────────────────────┘
```

**Status chip colours:**
- `Pending Upload` → Info blue
- `Uploaded` → Success green
- `Under Review` → Warning amber
- `Fines Issued` → Error red

---

### Screen 8: Settings

**Route:** `/settings`
**Purpose:** User preferences and account management

**Sections:**
- **Account** — name, email, change password, logout
- **Recording** — default resolution (1080p / 720p), chunk duration
- **AI** — toggle AI auto-flagging on/off; confidence threshold slider (60–90%)
- **Upload** — WiFi only (default) / allow mobile data toggle
- **Storage** — current usage, clear old trip files (with confirmation)
- **About** — app version, licenses, privacy policy

---

## 9. Data Contracts

### 9.1 POST /api/trips — Create Trip

**Request:**
```json
{
  "trip_id": "9e8d7f6a-0001-0000-0000-000000000001",
  "started_at": "2025-03-19T08:30:00Z",
  "gps_start": { "lat": 28.4595, "lng": 77.0266 },
  "device_model": "Pixel 7",
  "android_version": "14",
  "app_version": "1.0.0"
}
```

**Response:**
```json
{
  "trip_id": "9e8d7f6a-0001-0000-0000-000000000001",
  "status": "created"
}
```

### 9.2 POST /api/clips/upload — Clip Upload

**Request:** `multipart/form-data`
- `file`: `.mp4` binary
- `metadata`: JSON string

```json
{
  "clip_id": "3f4a1b2c-0001-0000-0000-000000000001",
  "trip_id": "9e8d7f6a-0001-0000-0000-000000000001",
  "timestamp_source": "AI",
  "ai_confidence": 0.82,
  "video_offset_ms": 1334000,
  "clip_duration_ms": 20000,
  "gps": { "lat": 28.4601, "lng": 77.0271, "accuracy_m": 3.8 },
  "recorded_at": "2025-03-19T08:52:14Z",
  "device_model": "Pixel 7",
  "android_version": "14",
  "app_version": "1.0.0"
}
```

**Response:**
```json
{
  "clip_id": "3f4a1b2c-0001-0000-0000-000000000001",
  "status": "queued",
  "ai_analysis_eta_seconds": 45
}
```

### 9.3 GET /api/portal/trips/:tripId/clips — Clip List for Reviewer

**Response:**
```json
{
  "trip_id": "9e8d7f6a-...",
  "total_clips": 6,
  "reviewed_count": 2,
  "clips": [
    {
      "clip_id": "3f4a1b2c-...",
      "thumbnail_url": "https://signed-url.../thumb.jpg?X-Amz-Expires=3600",
      "video_url": "https://signed-url.../clip.mp4?X-Amz-Expires=3600",
      "timestamp_source": "AI",
      "ai_device_confidence": 0.82,
      "ai_server_confidence": 0.88,
      "ai_server_label": "RIGHT",
      "gps": { "lat": 28.4601, "lng": 77.0271 },
      "recorded_at": "2025-03-19T08:52:14Z",
      "review_status": "PENDING"
    }
  ]
}
```

### 9.4 POST /api/portal/clips/:clipId/decision

**Request:**
```json
{
  "decision": "CONFIRMED",
  "note": "Clear rightward lane change in clip frame 00:08–00:12. No signal."
}
```

**Response:**
```json
{
  "clip_id": "3f4a1b2c-...",
  "review_status": "CONFIRMED",
  "fine_status": "QUEUED"
}
```

### 9.5 POST /api/portal/fines/:clipId/issue

**Request:**
```json
{
  "license_plate": "DL01AB1234",
  "violation_type": "LANE_CHANGE_NO_SIGNAL",
  "fine_amount": 500,
  "currency": "INR",
  "notes": "Rightward lane change at km marker 14.2, NH48. No indicator used."
}
```

**Response:**
```json
{
  "fine_id": "fine-uuid-0001",
  "clip_id": "3f4a1b2c-...",
  "status": "ISSUED",
  "issued_at": "2025-03-19T14:00:00Z"
}
```

---

## 10. User Flows

### 10.1 First-Time User Flow

```
Install app
    │
    ▼
Splash (1.5s)
    │
    ▼
Onboarding (3 pages)
    │
    ▼
Permission requests (camera, mic, location)
    │
    ├── All granted → Register screen
    └── Any denied → Explanation screen → Settings deep-link
    │
    ▼
Register (name + email + password)
    │
    ▼
Home screen
    │
    ▼
Tap "Start Trip"
    │
    ▼
Active Trip (recording)
    │
    ▼
Long-press "End Trip"
    │
    ▼
Trip Review (edit timestamps)
    │
    ▼
Tap "Process & Upload"
    │
    ▼
Processing (clipping)
    │
    ▼
"Will upload on WiFi" confirmation
    │
    ▼
Home screen (Upload Pending banner visible)
    │
    ▼ (WiFi connected)
Background upload completes
    │
    ▼
Notification: "Your clips are safe and ready for review."
```

### 10.2 Returning User Flow

```
Open app → Splash (0.8s)
    │
    ▼
Home screen
    │
    ├── Upload pending? → Banner shows → upload on WiFi
    ├── Existing trips? → Show in list with status chips
    └── Tap "Start Trip" → Active Trip
```

### 10.3 Reviewer Flow (Portal)

```
Login to portal → /portal/trips
    │
    ▼
Select trip from queue
    │
    ▼
/portal/trips/:tripId — clip list in sidebar
    │
    ▼
Click clip → video autoplays in centre panel
    │
    ▼
Review: watch clip, check AI confidence, check GPS
    │
    ├── CONFIRM → clip moves to Fine Queue; next clip loads
    └── REJECT  → select reason → clip archived; next clip loads
    │
    ▼
All clips reviewed → Trip marked REVIEWED
```

### 10.4 Officer Fine Issuance Flow

```
Login to portal → /portal/fines/queue
    │
    ▼
Select confirmed violation
    │
    ▼
Watch clip, read reviewer note
    │
    ▼
Open fine issuance drawer
    │
    ▼
Enter license plate (from video), select fine tier, add notes
    │
    ▼
[Issue Fine] → fine record created → status: ISSUED
    │
    ▼
Clip appears in /portal/fines/history
```

---

## 11. Error States

| Scenario | Location | System Behaviour | User Message |
|---|---|---|---|
| Storage < 500 MB before trip | App — Home | Warning dialog; user may proceed | "You're running low on space. Free some up for a better experience." |
| Storage < 100 MB mid-recording | App — Active Trip | Auto-stop recording; save completed chunks | "We had to stop — your storage is almost full." |
| App crash mid-trip | App | Completed 5-min chunks intact; partial chunk dropped | On reopen: "Looks like your last trip was interrupted. Here's what we saved." |
| Camera permission denied | App — Onboarding | Recording unavailable; Settings deep-link shown | "Camera access is needed to record. Open Settings to allow it." |
| Mic permission denied | App | Voice keyword disabled silently | Subtle banner: "Voice marks are off. Tap to enable in Settings." |
| TFLite model fails to load | App | AI flagging disabled; other timestamp sources work | "AI detection is unavailable right now. You can still mark manually." |
| Thermal throttle > 43°C | App — Active Trip | AI sampling halved (5 FPS) | Toast: "Your phone needs a breather. We've slowed AI analysis." |
| No WiFi after trip processed | App | Upload queued; WorkManager retries on WiFi | Badge: "N clips waiting for WiFi." |
| Upload HTTP error (5xx) | App | Exponential backoff: 30s → 2m → 10m | After 3 failures: "Upload hit a snag. Tap to retry manually." |
| Clip file corrupted | App | Skip clip; log `UPLOAD_ERROR`; continue others | "1 clip couldn't be uploaded. Others are fine." |
| Backend AI worker failure | Backend | Clip proceeds to portal; `ai_server_confidence: null` | Portal shows: "AI analysis unavailable for this clip." |
| JWT expired during upload | App | Refresh token used to get new JWT silently | No user-visible interruption |
| Reviewer tries to issue fine (wrong role) | Portal | 403 returned; fine form never shown | "You don't have permission to issue fines." |
| Fine issued on wrong clip | Portal | Admin sets `fine.status = CANCELLED` | Audit log preserved; no auto-notification in v1 |
| S3 signed URL expired in portal | Portal | Portal re-fetches fresh URL automatically | No interruption if handled; "Video unavailable" if not |

---

## 12. Development Conventions

### 12.1 Naming Conventions

**Flutter (Dart):**

| Type | Convention | Example |
|---|---|---|
| Files | `snake_case.dart` | `trip_review_screen.dart` |
| Classes | `PascalCase` | `TripReviewScreen` |
| Variables / functions | `camelCase` | `currentTrip`, `startRecording()` |
| Constants | `camelCase` with `const` | `const maxMissedFrames = 10` |
| Providers (Riverpod) | `camelCaseProvider` | `tripRecordingProvider` |
| Enums | `PascalCase` values | `TimestampSource.ai` |
| Route constants | `AppRoutes.tripReview` | — |

**Backend (Python):**

| Type | Convention | Example |
|---|---|---|
| Files / modules | `snake_case.py` | `clips_service.py` |
| Classes | `PascalCase` | `ClipUploadMetadata` |
| Functions | `snake_case` | `get_signed_url()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_CLIP_DURATION_MS` |
| DB tables | `snake_case` plural | `violation_clips` |
| Env variables | `UPPER_SNAKE_CASE` | `S3_BUCKET_NAME` |

**Portal (TypeScript):**

| Type | Convention | Example |
|---|---|---|
| Files | `PascalCase.tsx` | `ClipPlayer.tsx` |
| Components | `PascalCase` | `ConfidenceBadge` |
| Hooks | `useCamelCase` | `useClipReview` |
| API functions | `camelCase` | `fetchTripClips()` |
| Types / interfaces | `PascalCase` | `ClipReviewDecision` |

### 12.2 Versioning Rules

- **Semantic versioning:** `MAJOR.MINOR.PATCH` (e.g. `1.0.0`)
- `MAJOR` — breaking API change or major architecture shift
- `MINOR` — new feature, backward-compatible
- `PATCH` — bug fix, copy change, minor UI tweak
- **Flutter `pubspec.yaml`:** `version: 1.0.0+1` (build number increments per release)
- **Git tags:** `v1.0.0` on every release commit
- **API versioning:** URL prefix `/api/v1/` — increment to `/api/v2/` only on breaking change
- **DB migrations:** Alembic; migration files named `YYYYMMDD_HHMMSS_description.py`

### 12.3 Environment Configuration

**Flutter — `.env` via `flutter_dotenv`:**
```
API_BASE_URL=https://api.drishtipath.app/api/v1
SENTRY_DSN=https://...
APP_ENV=production
```

**Backend — `.env` via `pydantic-settings`:**
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/drishtipath
SECRET_KEY=<256-bit random>
S3_BUCKET_NAME=drishtipath-clips
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
REDIS_URL=redis://localhost:6379/0
APP_ENV=production
JWT_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
```

**Environments:**

| Env | Flutter API | Backend DB | Notes |
|---|---|---|---|
| `local` | `localhost:8000` | Local PostgreSQL | Dev machines |
| `staging` | `staging-api.drishtipath.app` | Staging DB (separate) | Pre-release testing |
| `production` | `api.drishtipath.app` | Production DB | Live users |

### 12.4 CI/CD

**Flutter (GitHub Actions):**
```yaml
on: [push, pull_request]
jobs:
  test:
    - flutter analyze
    - flutter test
  build:
    - flutter build apk --release (staging)
    - flutter build appbundle --release (production)
  deploy:
    - Upload to Firebase App Distribution (staging)
    - Upload to Google Play (production, manual trigger)
```

**Backend (GitHub Actions):**
```yaml
on: [push]
jobs:
  test:
    - pytest --cov=app tests/
    - ruff check app/
  build:
    - docker build -t drishtipath-api .
  deploy:
    - docker push to registry
    - Railway / Render auto-deploy on main branch
```

**Portal (Vercel):**
- Auto-deploy on push to `main` branch
- Preview deployments on pull requests
- Environment variables set in Vercel dashboard per environment

### 12.5 Git Branch Strategy

```
main          ← production; protected; requires PR + 1 review
staging       ← staging environment; merges from feature branches
feature/*     ← individual features (e.g. feature/voice-bridge)
fix/*         ← bug fixes
hotfix/*      ← production hotfixes; merges directly to main + staging
```

### 12.6 Testing Checklist

**Flutter (per feature PR):**
- [ ] Unit tests for all service classes (`trip_repository`, `clip_processor`, etc.)
- [ ] Widget tests for all new screens
- [ ] Golden tests for UI components with brand tokens
- [ ] Integration test: full trip flow (record → clip → upload stub)
- [ ] `flutter analyze` passes with zero warnings
- [ ] Tested on physical device (not emulator only) for camera + AI performance
- [ ] Tested on API 31 and API 34

**Backend (per PR):**
- [ ] Unit tests for all service functions
- [ ] Integration tests for all API endpoints (using `httpx` + test DB)
- [ ] AI worker tested with sample clip
- [ ] S3 upload + signed URL tested against staging bucket
- [ ] `ruff` linting passes
- [ ] Alembic migration tested: `upgrade` + `downgrade`

**Portal (per PR):**
- [ ] Component tests with React Testing Library
- [ ] Reviewer flow E2E (Playwright): login → select trip → confirm clip
- [ ] Officer flow E2E: fine queue → issue fine
- [ ] Responsive: tested at 1280px, 1440px, 1920px
- [ ] Video player tested with real clip (not placeholder)

**Manual QA checklist (pre-release):**
- [ ] Cold start to recording in < 3 seconds
- [ ] AI flags generated on real road footage
- [ ] Voice "mark" registers within 1 second of speaking
- [ ] Trip Review scrubber plays correctly across chunk boundaries
- [ ] Clip extraction produces valid, playable MP4
- [ ] Upload completes on WiFi; retry works on flaky network
- [ ] Portal reviewer can watch clip, confirm, and see it in fine queue
- [ ] Officer can issue fine end-to-end
- [ ] All error states tested (storage low, no WiFi, model load fail)

---

*Document version: `1.0.0` | Status: Internal Draft*
*Authors: 22 Code — Mehak, Nimish, Nitesh, Tushar, Palak, Shivam*
*K.R. Mangalam University | Collaborative Solutions Lab, Semester 2*
