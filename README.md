<div align="center">
  <img src="./logo.png" alt="Drishti-Path Logo" width="150" height="150" style="border-radius: 20px; margin-bottom: 20px;" />
  
  # Drishti-Path
  ### Every road, watched over.

  <p align="center">
    <strong>See the road clearly with our AI-powered driving violation detection ecosystem.</strong>
  </p>

  <p align="center">
    <a href="#overview">Overview</a> •
    <a href="#system-architecture">Architecture</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/YOLOv8-FF79C6?style=for-the-badge&logo=pytorch&logoColor=white" alt="YOLOv8" />
  </p>
</div>

---

## 👁 Overview

**Drishti-Path** (*Drishti* meaning Vision, *Path* meaning Road) is a modern, high-end ecosystem designed to make roads safer by leveraging on-device Edge AI, robust cloud processing, and an intuitive web review and **Challan** system portal.

The system acts as a sophisticated digital co-pilot: the mobile application uses the smartphone's camera to monitor the road and detect lane-change violations in real-time. Video clips of suspected violations are chunked, securely uploaded, and re-analyzed by the cloud before being presented to human reviewers and traffic officers for final adjudication. 

Drishti-Path is built on the philosophy that **AI should assist, but humans should decide.**



<br>
<br>
<br>

## 📐 System Architecture

Drishti-Path operates across three deeply integrated layers:

### 1. Mobile Edge Node (Flutter + TFLite)
The mobile app acts as a dashboard-mounted dashcam. It captures video at 1080p, runs inference using a highly quantized **YOLOv8-nano** model (`tflite_flutter`), and tracks vehicle centroids to identify lateral drift. It supports voice-activated timestamping ("mark!") and manages local SQLite storage to ensure no data is lost before uploading over WiFi.

### 2. Cloud Intelligence (FastAPI + Celery)
The backend serves as the brain of the ecosystem. Built on **FastAPI** and **PostgreSQL**, it securely ingests chunked video uploads to S3-compatible storage. Background workers driven by Celery and Redis run a heavier **YOLOv8-small** model to double-check the mobile app's flags, generating strict confidence scores and evidence frames.

### 3. Review & Adjudication Portal (Next.js)
A sleek, glassmorphic Next.js web portal empowers reviewers to confirm or reject flagged clips. Verified violations are passed to an Officer role, where fine issuance forms and license plate details are managed in a fast, responsive interface.

---



## ✨ Features

- **Real-Time Edge Inference**: On-device YOLOv8-nano processing at 10-15 FPS, conserving data and ensuring immediate localized awareness.
- **Centroid Tracking**: Advanced lateral movement algorithms to confidently detect lane-change anomalies.
- **Voice-Activated Bookmarking**: Hands-free clip marking by simply saying the "mark" keyword, captured via a custom Kotlin bridge.
- **Resilient Uploads**: Intelligent exponential backoff syncing that waits for WiFi to preserve cellular data.
- **Double-Verification Pipeline**: All flags are re-verified by a heavier cloud-based model to minimize false positives.
- **Premium UI/UX**: An interface that breathes—utilizing a carefully crafted brand palette (`Blossom Pink`, `Lavender Mist`, `Warm Peach`) with soft glassmorphism, micro-animations, and elegant typography (DM Sans & Playfair Display).

---

## 🛠 Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Mobile App** | Flutter 3.x, Dart, Riverpod, Drift (SQLite), GoRouter, TFLite Flutter, FFMpeg Kit |
| **Backend API** | Python 3.11, FastAPI, SQLAlchemy, Alembic, PostgreSQL 15 |
| **AI Workers** | Celery, Redis, YOLOv8 (Ultralytics), OpenCV, AWS S3 / MinIO |
| **Web Portal** | React, Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Leaflet.js |

---





## 🚀 Getting Started

### Prerequisites

- **Flutter SDK**: 3.x+
- **Python**: 3.11+ (with pip/venv)
- **Node.js**: 18.x+
- **Database**: PostgreSQL 15+ and Redis

### 1. Backend Setup (FastAPI)

```bash
cd fastapi-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed data
alembic upgrade head
python check_pass.py  # Seed initial admin user if needed

# Start the server
python run_backend.py
```

### 2. Web Portal Setup (Next.js)

```bash
cd web-portal
npm install
npm run dev
# The portal will be available at http://localhost:3000
```

### 3. Mobile App Setup (Flutter)

```bash
cd flutter_app
flutter pub get
flutter run
# Ensure you are running on an actual Android device (not an emulator) for camera and Edge AI support.
```

---

## 🔒 Security & Privacy

Privacy is a core tenet of Drishti-Path. 
* **Data Locality:** Video files remain on the user's device until a WiFi connection is established.
* **Signed URLs:** Cloud video assets are served using 1-hour expiry signed URLs; they are never publicly accessible.
* **Human in the Loop:** The AI acts strictly as a filter. No automated fines are ever issued without confirmation from an authorized officer.

---

<div align="center">
  <p><i>Designed with care to make every road, watched over.</i></p>
</div>
