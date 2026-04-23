"use client";

import { useState } from "react";

interface ReviewDecisionPanelProps {
  clipId: string;
  onDecision: (decision: "CONFIRMED" | "REJECTED", note: string, reason?: string) => void;
  isLoading?: boolean;
}

const REJECTION_REASONS = [
  "Not a lane change — vehicle is turning",
  "Lane change but signal was used",
  "Obstruction in video — unclear footage",
  "Wrong vehicle flagged",
  "False positive — no lane change occurred",
  "Other",
];

export default function ReviewDecisionPanel({ clipId, onDecision, isLoading = false }: ReviewDecisionPanelProps) {
  const [note, setNote] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleConfirm = () => {
    if (!note.trim()) return;
    onDecision("CONFIRMED", note);
    setNote("");
  };

  const handleReject = () => {
    if (!selectedReason) return;
    onDecision("REJECTED", note || selectedReason, selectedReason);
    setNote("");
    setSelectedReason("");
    setShowRejectForm(false);
  };

  return (
    <div className="card animate-fade-in" style={{ background: "var(--cloud-white)" }}>
      <h3 className="heading-sm mb-4" style={{ color: "var(--ink)" }}>
        Review Decision
      </h3>

      <p className="body-sm mb-1" style={{ color: "var(--ash)" }}>
        Clip ID: {clipId.slice(0, 8)}...
      </p>

      {/* Note input */}
      <div className="mt-4">
        <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
          Your notes
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what you see in the clip..."
          className="input-field"
          style={{ height: "100px", paddingTop: "12px", resize: "vertical" }}
        />
      </div>

      {/* Reject reason selection */}
      {showRejectForm && (
        <div className="mt-4 animate-fade-in">
          <label className="label-lg block mb-2" style={{ color: "var(--charcoal)" }}>
            Reason for rejection
          </label>
          <div className="flex flex-col gap-2">
            {REJECTION_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 p-3 rounded-[12px] cursor-pointer transition-all duration-200"
                style={{
                  background: selectedReason === reason ? "rgba(168, 85, 247, 0.08)" : "var(--parchment)",
                  border: selectedReason === reason ? "1.5px solid var(--electric-lavender)" : "1.5px solid transparent",
                }}
              >
                <input
                  type="radio"
                  name="reject-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: selectedReason === reason ? "var(--electric-lavender)" : "var(--muted-stone)",
                  }}
                >
                  {selectedReason === reason && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--electric-lavender)" }} />
                  )}
                </div>
                <span className="body-md" style={{ color: "var(--charcoal)" }}>
                  {reason}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        {!showRejectForm ? (
          <>
            <button
              onClick={handleConfirm}
              disabled={!note.trim() || isLoading}
              className="btn-primary flex-1"
              style={{ background: note.trim() ? undefined : undefined }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Confirm Violation
                </>
              )}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isLoading}
              className="btn-destructive flex-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleReject}
              disabled={!selectedReason || isLoading}
              className="btn-destructive flex-1"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                "Confirm Rejection"
              )}
            </button>
            <button
              onClick={() => { setShowRejectForm(false); setSelectedReason(""); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
