"use client";

interface ConfidenceBadgeProps {
  confidence: number | null;
  source?: "AI" | "VOICE" | "MANUAL";
  size?: "sm" | "md";
}

export default function ConfidenceBadge({ confidence, source, size = "md" }: ConfidenceBadgeProps) {
  if (source === "VOICE") {
    return (
      <span className={`badge badge-lavender ${size === "sm" ? "text-[11px]" : ""}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        Voice
      </span>
    );
  }

  if (source === "MANUAL") {
    return (
      <span className={`badge badge-peach ${size === "sm" ? "text-[11px]" : ""}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 13" />
        </svg>
        Manual
      </span>
    );
  }

  // AI confidence badge
  if (confidence === null) {
    return (
      <span className={`badge badge-info ${size === "sm" ? "text-[11px]" : ""}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        N/A
      </span>
    );
  }

  const percentage = Math.round(confidence * 100);
  let badgeClass = "badge-error";
  let label = "Low";

  if (percentage >= 80) {
    badgeClass = "badge-success";
    label = "High";
  } else if (percentage >= 60) {
    badgeClass = "badge-warning";
    label = "Mid";
  }

  return (
    <span className={`badge ${badgeClass} ${size === "sm" ? "text-[11px]" : ""}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.09-2.3 4.09a14.06 14.06 0 0 0-1.7 2.41" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.09 2.3 4.09A14.06 14.06 0 0 1 12 12.5" />
        <path d="M8 15h8" />
        <path d="M9 18h6" />
      </svg>
      {percentage}% · {label}
    </span>
  );
}
