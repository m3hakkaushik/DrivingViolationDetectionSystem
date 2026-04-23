"use client";

import { useMemo, useEffect, useState } from "react";

interface EvidenceFrame {
  frame_ms: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  label: string;
  confidence: number;
}

interface AiEvidenceOverlayProps {
  currentTimeMs: number;
  evidenceFrames: EvidenceFrame[];
  isVisible: boolean;
  direction?: string | null; // "LEFT" | "RIGHT" | "STRAIGHT" | null
}

export default function AiEvidenceOverlay({
  currentTimeMs,
  evidenceFrames,
  isVisible,
  direction,
}: AiEvidenceOverlayProps) {
  const [pulseKey, setPulseKey] = useState(0);

  // Widen detection window to ±1500ms for smooth display
  const WINDOW_MS = 1500;

  const activeFrames = useMemo(() => {
    if (!isVisible || evidenceFrames.length === 0) return [];
    return evidenceFrames.filter(
      (frame) => Math.abs(frame.frame_ms - currentTimeMs) < WINDOW_MS
    );
  }, [currentTimeMs, evidenceFrames, isVisible]);

  // Trigger pulse animation when new frames appear
  useEffect(() => {
    if (activeFrames.length > 0) {
      setPulseKey((k) => k + 1);
    }
  }, [activeFrames.length]);

  // Show direction banner if we have evidence frames anywhere (not just active)
  const hasAnyEvidence = evidenceFrames.length > 0;
  const showBanner = isVisible && hasAnyEvidence && direction && direction !== "STRAIGHT" && direction !== "UNKNOWN";

  if (!isVisible) return null;

  const directionLabel = direction === "RIGHT" ? "→ Right Lane Change" : direction === "LEFT" ? "← Left Lane Change" : null;
  const bannerColor = direction === "RIGHT" ? "rgba(168,85,247,0.92)" : "rgba(239,68,68,0.92)";

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Direction Banner */}
      {showBanner && directionLabel && (
        <div
          className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold tracking-wide"
          style={{
            background: bannerColor,
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
            animation: "fadeInDown 0.4s ease both",
          }}
        >
          {/* Pulsing AI dot */}
          <span
            className="w-2 h-2 rounded-full bg-white"
            style={{ animation: "pulse 1.2s infinite" }}
          />
          <span>AI DETECTED</span>
          <span
            className="mx-1 text-white/50"
            style={{ fontSize: "10px" }}
          >
            |
          </span>
          <span>{directionLabel}</span>
        </div>
      )}

      {/* Bounding Boxes */}
      {activeFrames.map((frame, index) => {
        const [x1, y1, x2, y2] = frame.bbox;
        // Calculate percentages based on 1920x1080 reference — fallback to 640x360
        // Use adaptive scaling: if bbox values suggest HD we use 1920x1080, else 640x360
        const refW = x2 > 640 ? 1920 : 640;
        const refH = y2 > 360 ? 1080 : 360;
        const left = (x1 / refW) * 100;
        const top = (y1 / refH) * 100;
        const width = ((x2 - x1) / refW) * 100;
        const height = ((y2 - y1) / refH) * 100;
        const isClose = Math.abs(frame.frame_ms - currentTimeMs) < 500;

        return (
          <div
            key={`${frame.frame_ms}-${index}-${pulseKey}`}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              border: `2px solid ${isClose ? "var(--electric-lavender)" : "rgba(168,85,247,0.5)"}`,
              boxShadow: isClose
                ? "0 0 16px rgba(168,85,247,0.6), inset 0 0 8px rgba(168,85,247,0.15)"
                : "0 0 6px rgba(168,85,247,0.2)",
              background: isClose
                ? "rgba(168,85,247,0.12)"
                : "rgba(168,85,247,0.05)",
              animation: isClose ? "bboxPulse 1.5s ease-in-out infinite" : "fadeInBox 0.3s ease both",
              transition: "all 0.2s ease",
            }}
          >
            {/* Label tag */}
            <div
              className="absolute top-0 left-0 -translate-y-full flex items-center gap-1 px-2 py-0.5 rounded-t-sm whitespace-nowrap"
              style={{
                background: "var(--electric-lavender)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {/* AI brain icon */}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                <path d="M12 2a9 9 0 1 0 9 9A9 9 0 0 0 12 2zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7z" opacity="0.4"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
              <span
                className="font-bold uppercase tracking-wider text-white"
                style={{ fontSize: "9px" }}
              >
                {frame.label}
              </span>
              <span
                className="text-white/80"
                style={{ fontSize: "9px" }}
              >
                {(frame.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}

      {/* Scan line effect when evidence is active */}
      {activeFrames.length > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.04) 50%, transparent 100%)",
            animation: "scanLine 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

