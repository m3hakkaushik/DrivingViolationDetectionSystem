import { fetchApi } from "@/lib/api-client";
import { User } from "@/stores/auth-store";

// ======================
// TypeScript Interfaces
// ======================
export interface Trip {
  id: string;
  user_id: string;
  user_name: string;
  driver_id?: string;
  vehicle_id?: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
  status: "UPLOADED" | "UNDER_REVIEW" | "REVIEWED" | "FINES_ISSUED" | "COMPLETED";
  overall_status?: string; 
  review_status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  gps_start_lat: number;
  gps_start_lng: number;
  device_model: string;
  total_clips: number;
  total_ai_flags: number;
  total_voice_flags: number;
  total_manual_flags: number;
  reviewed_clips: number;
  created_at?: string;
}

export interface Clip {
  id: string;
  trip_id: string;
  user_id: string;
  thumbnail_url: string | null;
  video_url: string | null;
  timestamp_source: "AI" | "VOICE" | "MANUAL";
  ai_device_confidence: number | null;
  ai_server_confidence: number | null;
  ai_server_label: "LEFT" | "RIGHT" | null;
  ai_evidence_frames?: string | null; // Raw JSON string from DB
  evidence_frames_list: {
    frame_ms: number;
    bbox: [number, number, number, number];
    label: string;
    confidence: number;
  }[]; // Parsed list (computed by backend)
  gps_lat: number | null;
  gps_lng: number | null;
  recorded_at: string | null;
  video_offset_ms: number | null;
  clip_duration_ms: number | null;
  review_status: "PENDING" | "CONFIRMED" | "REJECTED";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  fine_status: "NONE" | "QUEUED" | "ISSUED";
  created_at: string;
}

export interface Fine {
  id: string;
  clip_id: string;
  user_id: string;
  issued_by: string;
  license_plate: string;
  violation_type: string;
  fine_amount: number;
  notes: string;
  issued_at: string;
  status: "ISSUED" | "PAID" | "CANCELLED" | "DISPUTED";
}

// ======================
// API Functions 
// ======================

// Trips / Reviewer 
export async function getTripsQueue(): Promise<Trip[]> {
  return fetchApi<Trip[]>("/portal/trips");
}

export async function getTrip(tripId: string): Promise<Trip> {
  return fetchApi<Trip>(`/portal/trips/${tripId}`);
}


export async function getTripClips(tripId: string): Promise<Clip[]> {
  return fetchApi<Clip[]>(`/portal/trips/${tripId}/clips`);
}

export async function submitClipReview(
  clipId: string, 
  decision: "CONFIRMED" | "REJECTED", 
  note: string
): Promise<Clip> {
  return fetchApi<Clip>(`/portal/clips/${clipId}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, note }),
  });
}

// Fines / Officer
export async function getFineQueue(): Promise<Clip[]> {
  return fetchApi<Clip[]>("/portal/fines/queue");
}

export async function getFinesHistory(): Promise<Fine[]> {
  return fetchApi<Fine[]>("/fines");
}

export async function issueFine(payload: {
  clip_id: string;
  license_plate: string;
  violation_type: string;
  fine_amount: number;
  notes: string;
}): Promise<Fine> {
  return fetchApi<Fine>("/portal/fines/issue", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Users / Admin
export async function getAllUsers(): Promise<User[]> {
  return fetchApi<User[]>("/portal/users");
}

// Re-run AI Analysis
export async function rerunAiAnalysis(clipId: string): Promise<{ clip_id: string; task_id: string; status: string }> {
  return fetchApi(`/portal/clips/${clipId}/rerun-ai`, { method: "POST" });
}
