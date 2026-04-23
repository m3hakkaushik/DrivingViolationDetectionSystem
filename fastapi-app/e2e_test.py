#!/usr/bin/env python3
"""
Drishti-Path — Full End-to-End System Test
Tests: Auth → Trip Create → Clip Upload (with real video) → AI Analysis → Portal Review → Fine Issuance
"""
import asyncio, requests, json, os, sys, uuid, time

BASE = "http://localhost:8000/api"
VIDEO_PATH = "/Users/nimishkumar/main_dir/Program1/csl/dir/project_1/sample_video_for_webportal/test_video_1.mov"

PASS = "\033[92m✅"
FAIL = "\033[91m❌"
INFO = "\033[94m🔵"
WARN = "\033[93m⚠️"
RESET = "\033[0m"

results = []

def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    tag = "PASS" if condition else "FAIL"
    print(f"  {status} {name}{RESET}" + (f"  →  {detail}" if detail else ""))
    results.append((tag, name))
    return condition

# ============================================================
print(f"\n{INFO} ═══════════════════════════════════════════{RESET}")
print(f"{INFO} DRISHTI-PATH END-TO-END SYSTEM CHECK{RESET}")
print(f"{INFO} ═══════════════════════════════════════════{RESET}\n")

# ─── 1. HEALTH CHECK ────────────────────────────────────────
print("📋 [1/7] HEALTH CHECK")
r = requests.get("http://localhost:8000/health", timeout=5)
check("Backend alive", r.status_code == 200, r.json().get("status"))

try:
    r2 = requests.get("http://localhost:3000", timeout=5)
    check("Web portal alive", r2.status_code == 200, "Next.js responding")
except Exception as e:
    check("Web portal alive", False, f"Timeout/Error: {str(e)[:80]}")

# ─── 2. AUTH - LOGIN as DRIVER ──────────────────────────────
print("\n📋 [2/7] AUTHENTICATION")
r = requests.post(f"{BASE}/auth/login", json={"email": "nikhil@example.com", "password": "password123"})
driver_ok = check("Driver login", r.status_code == 200, f"status={r.status_code}")
if not driver_ok:
    print(f"  {WARN} Response: {r.text[:200]}{RESET}")
    print(f"\n  {FAIL} CRITICAL: Cannot authenticate. Stopping test.{RESET}")
    sys.exit(1)

driver_token = r.json()["access_token"]
driver_headers = {"Authorization": f"Bearer {driver_token}"}
check("Driver token received", bool(driver_token), driver_token[:30] + "...")

r = requests.post(f"{BASE}/auth/login", json={"email": "palak@example.com", "password": "password123"})
check("Reviewer login", r.status_code == 200, f"status={r.status_code}")
reviewer_token = r.json()["access_token"] if r.status_code == 200 else None
reviewer_headers = {"Authorization": f"Bearer {reviewer_token}"} if reviewer_token else {}

r = requests.post(f"{BASE}/auth/login", json={"email": "shivam@example.com", "password": "password123"})
check("Officer login", r.status_code == 200, f"status={r.status_code}")
officer_token = r.json()["access_token"] if r.status_code == 200 else None
officer_headers = {"Authorization": f"Bearer {officer_token}"} if officer_token else {}

r = requests.post(f"{BASE}/auth/login", json={"email": "tushar@example.com", "password": "password123"})
check("Admin login", r.status_code == 200)
admin_token = r.json()["access_token"] if r.status_code == 200 else None
admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

# ─── 3. TRIP CREATION ───────────────────────────────────────
print("\n📋 [3/7] TRIP MANAGEMENT")
trip_id = f"test-trip-{uuid.uuid4().hex[:8]}"
r = requests.post(f"{BASE}/trips/", headers=driver_headers, json={
    "trip_id": trip_id,
    "started_at": "2026-04-19T07:00:00Z",
    "gps_start_lat": 28.6139,
    "gps_start_lng": 77.2090,
    "device_model": "E2E Test Device",
})
check("Create trip", r.status_code == 201, f"trip_id={trip_id}")
if r.status_code != 201:
    print(f"  {WARN} {r.text[:300]}{RESET}")

r2 = requests.get(f"{BASE}/trips/", headers=driver_headers)
check("List trips (driver)", r2.status_code == 200, f"count={len(r2.json())}")
trip_data = r2.json()
check("Trip appears in list", any(t["id"] == trip_id for t in trip_data))

# ─── 4. CLIP UPLOAD (with real video file) ──────────────────
print("\n📋 [4/7] CLIP UPLOAD (test_video_1.mov)")
clip_id = f"test-clip-{uuid.uuid4().hex[:8]}"
check("Test video file exists", os.path.exists(VIDEO_PATH), VIDEO_PATH)
file_size_mb = os.path.getsize(VIDEO_PATH) / (1024*1024)
print(f"  {INFO} Video size: {file_size_mb:.1f} MB{RESET}")

if os.path.exists(VIDEO_PATH):
    metadata = json.dumps({
        "clip_id": clip_id,
        "trip_id": trip_id,
        "timestamp_source": "AI",
        "ai_confidence": 0.87,
        "video_offset_ms": 14200,
        "clip_duration_ms": 20000,
        "gps": {"lat": 28.6139, "lng": 77.2090},
    })
    with open(VIDEO_PATH, "rb") as f:
        r = requests.post(
            f"{BASE}/clips/upload",
            headers=driver_headers,
            files={"file": ("test_video_1.mov", f, "video/quicktime")},
            data={"metadata": metadata},
            timeout=120,  # large file
        )
    check("Clip upload (real video)", r.status_code in (200, 201), f"status={r.status_code}")
    if r.status_code in (200, 201):
        clip_resp = r.json()
        check("Clip ID returned", "clip_id" in clip_resp, clip_resp.get("clip_id"))
        check("Status is queued", clip_resp.get("status") == "queued", clip_resp.get("status"))
        actual_clip_id = clip_resp.get("clip_id", clip_id)
    else:
        print(f"  {WARN} Upload response: {r.text[:400]}{RESET}")
        actual_clip_id = clip_id
else:
    print(f"  {WARN} Skipping upload — video file not found{RESET}")
    actual_clip_id = clip_id

# ─── 5. PORTAL (reviewer) ───────────────────────────────────
print("\n📋 [5/7] PORTAL — REVIEWER FLOW")

# Reviewer sees trips
r = requests.get(f"{BASE}/portal/trips", headers=reviewer_headers)
check("Reviewer can list trips", r.status_code == 200, f"count={len(r.json())}")
portal_trips = r.json()
check("Trip has user_name field", all("user_name" in t for t in portal_trips) if portal_trips else True)
check("Trip has reviewed_clips field", all("reviewed_clips" in t for t in portal_trips) if portal_trips else True)

# Reviewer sees clips for the trip
r = requests.get(f"{BASE}/portal/trips/{trip_id}/clips", headers=reviewer_headers)
check("Reviewer can list clips for trip", r.status_code == 200, f"status={r.status_code}")
portal_clips = r.json() if r.status_code == 200 else []
check("Clip appears in portal", len(portal_clips) > 0, f"found {len(portal_clips)} clips")

if portal_clips:
    clip = portal_clips[0]
    actual_clip_id = clip["id"]
    check("Clip has video_url", clip.get("video_url") is not None, clip.get("video_url", "")[:60])
    check("Clip has evidence_frames_list", isinstance(clip.get("evidence_frames_list"), list))
    check("Video URL is accessible", requests.get(clip["video_url"], timeout=5).status_code == 200 if clip.get("video_url") else False)

    # Submit CONFIRMED decision
    r = requests.post(
        f"{BASE}/portal/clips/{actual_clip_id}/review",
        headers=reviewer_headers,
        json={"decision": "CONFIRMED", "note": "Clear right lane change. No indicator used."},
    )
    check("Submit CONFIRM decision", r.status_code == 200, f"status={r.status_code}")
    if r.status_code == 200:
        review_data = r.json()
        check("review_status = CONFIRMED", review_data.get("review_status") == "CONFIRMED")
        check("fine_status = QUEUED", review_data.get("fine_status") == "QUEUED")

# ─── 6. OFFICER — FINE ISSUANCE ─────────────────────────────
print("\n📋 [6/7] OFFICER — FINE ISSUANCE")

# Officer sees fine queue
r = requests.get(f"{BASE}/portal/fines/queue", headers=officer_headers)
check("Officer can see fine queue", r.status_code == 200, f"count={len(r.json()) if r.status_code==200 else 'ERR'}")
fine_queue = r.json() if r.status_code == 200 else []
check("Confirmed clip is in fine queue", any(c["id"] == actual_clip_id for c in fine_queue))

# Issue fine
if any(c["id"] == actual_clip_id for c in fine_queue):
    r = requests.post(
        f"{BASE}/portal/fines/issue",
        headers=officer_headers,
        json={
            "clip_id": actual_clip_id,
            "license_plate": "DL01AB1234",
            "violation_type": "LANE_CHANGE_NO_SIGNAL",
            "fine_amount": 500,
            "currency": "INR",
            "notes": "E2E test fine. Right lane change at NH48, no indicator.",
        },
    )
    check("Issue fine (challan)", r.status_code == 201, f"status={r.status_code}")
    if r.status_code == 201:
        fine_data = r.json()
        check("Fine has ID", "id" in fine_data, fine_data.get("id", "")[:20])
        check("License plate recorded", fine_data.get("license_plate") == "DL01AB1234")
        check("Fine amount is 500 INR", fine_data.get("fine_amount") == 500)
        check("Fine status = ISSUED", fine_data.get("status") == "ISSUED")
else:
    print(f"  {WARN} Skipping fine issuance — clip not in queue (review didn't persist){RESET}")

# ─── 7. ADMIN ───────────────────────────────────────────────
print("\n📋 [7/7] ADMIN CHECKS")
r = requests.get(f"{BASE}/portal/users", headers=admin_headers)
check("Admin can list all users", r.status_code == 200, f"count={len(r.json())}")

# Role enforcement — driver should NOT see portal trips
r = requests.get(f"{BASE}/portal/trips", headers=driver_headers)
check("Driver CANNOT access portal trips (403)", r.status_code == 403, f"status={r.status_code}")

# Role enforcement — driver should NOT see fine queue
r = requests.get(f"{BASE}/portal/fines/queue", headers=driver_headers)
check("Driver CANNOT access fine queue (403)", r.status_code == 403, f"status={r.status_code}")

# ─── SUMMARY ─────────────────────────────────────────────────
print(f"\n{INFO} ═══════════════════════════════════════════{RESET}")
passes = sum(1 for r, _ in results if r == "PASS")
fails  = sum(1 for r, _ in results if r == "FAIL")
total  = len(results)
print(f"  {'✅' if fails == 0 else '⚠️'} RESULTS: {passes}/{total} checks passed  ({fails} failed)")
if fails > 0:
    print(f"\n  {FAIL} FAILED CHECKS:{RESET}")
    for r, name in results:
        if r == "FAIL":
            print(f"    • {name}")
print(f"\n{INFO} ═══════════════════════════════════════════{RESET}\n")
