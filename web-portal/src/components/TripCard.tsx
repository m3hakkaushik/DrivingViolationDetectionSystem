"use client";

import { Trip } from "@/services/api";
import { formatDuration, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

interface TripCardProps {
  trip: Trip;
  index?: number;
}

function StatusChip({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    UPLOADED: { class: "badge-info", label: "Pending Review" },
    UNDER_REVIEW: { class: "badge-warning", label: "Under Review" },
    REVIEWED: { class: "badge-success", label: "Reviewed" },
    FINES_ISSUED: { class: "badge-error", label: "Fines Issued" },
    COMPLETED: { class: "badge-success", label: "Completed" },
  };

  const c = config[status] ?? { class: "badge-info", label: status };
  return <span className={`badge ${c.class}`}>{c.label}</span>;
}

export default function TripCard({ trip, index = 0 }: TripCardProps) {
  return (
    <Link href={`/portal/trips/${trip.id}`} className="block no-underline">
      <div
        className="card cursor-pointer group"
        style={{
          animationDelay: `${index * 60}ms`,
          animation: "fadeInUp 0.4s cubic-bezier(0.33, 1, 0.68, 1) both",
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="label-md" style={{ color: "var(--ash)" }}>
              {formatDate(trip.started_at)} · {formatTime(trip.started_at)}
            </p>
            <h3 className="heading-sm mt-1" style={{ color: "var(--ink)" }}>
              {trip.user_name}
            </h3>
          </div>
          <StatusChip status={trip.status} />
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ash)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="body-sm" style={{ color: "var(--charcoal)" }}>
              {formatDuration(trip.duration_ms)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ash)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15.2 16.9 1.4 1.4a2 2 0 1 0 2.8-2.8l-1.3-1.4" />
              <path d="m16.9 15.2 1.4 1.4" />
              <path d="M2 2v4l4.8 4.8" />
              <path d="m6.8 6.8 4-4" />
              <rect width="14" height="14" x="8" y="8" rx="2" />
            </svg>
            <span className="body-sm" style={{ color: "var(--charcoal)" }}>
              {trip.total_clips} clips
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ash)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18h8" />
              <path d="M3 22h18" />
              <path d="M14 22a7 7 0 1 0 0-14h-1" />
              <path d="M9 14h2" />
              <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
            </svg>
            <span className="body-sm" style={{ color: "var(--charcoal)" }}>
              {trip.total_ai_flags} AI · {trip.total_voice_flags} voice · {trip.total_manual_flags} manual
            </span>
          </div>
        </div>

        {trip.review_status === "IN_PROGRESS" && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="label-sm" style={{ color: "var(--ash)" }}>
                Review progress
              </span>
              <span className="label-sm" style={{ color: "var(--electric-lavender)" }}>
                {trip.reviewed_clips}/{trip.total_clips}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "var(--pale-gray)" }}>
              <div
                className="h-1.5 rounded-full gradient-primary transition-all duration-500"
                style={{ width: `${(trip.reviewed_clips / trip.total_clips) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div
          className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: "var(--electric-lavender)" }}
        >
          <span className="label-md">Review clips</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
