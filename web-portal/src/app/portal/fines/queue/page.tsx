"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import ClipPlayer from "@/components/ClipPlayer";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import FineIssuanceDrawer from "@/components/FineIssuanceDrawer";
import { formatTime } from "@/lib/utils";
import { getFineQueue, issueFine } from "@/services/api";

export default function FineQueuePage() {
  const queryClient = useQueryClient();

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["fineQueue"],
    queryFn: getFineQueue,
  });

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Auto-select first clip when loaded
  useMemo(() => {
    if (clips.length > 0 && !selectedClipId) {
      setSelectedClipId(clips[0].id);
    }
  }, [clips, selectedClipId]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [issuedFines, setIssuedFines] = useState<string[]>([]);

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  const issueFineMutation = useMutation({
    mutationFn: issueFine,
    onSuccess: (newFine, variables) => {
      setIssuedFines((prev) => [...prev, variables.clip_id]);
      
      // Update local cache
      queryClient.setQueryData(["fineQueue"], (oldClips: any) =>
        oldClips.map((c: any) =>
          c.id === variables.clip_id ? { ...c, fine_status: "ISSUED" } : c
        )
      );

      setIsDrawerOpen(false);

      // Auto-select next queued clip
      const nextQueued = clips.find(
        (c) => c.id !== variables.clip_id && !issuedFines.includes(c.id) && c.fine_status === "QUEUED"
      );
      if (nextQueued) {
        setSelectedClipId(nextQueued.id);
      }
    },
  });

  const handleIssueFine = (data: { license_plate: string; violation_type: string; fine_amount: number; notes: string }) => {
    if (!selectedClip) return;
    issueFineMutation.mutate({
      clip_id: selectedClip.id,
      ...data,
    });
  };

  const queuedClips = clips.filter((c) => !issuedFines.includes(c.id) && c.fine_status !== "ISSUED");

  if (isLoading) {
    return (
      <div>
        <Header title="Fine Queue" subtitle="Issue fines for confirmed violations" />
        <div className="p-16 flex justify-center">
           <div className="w-8 h-8 border-4 border-t-[var(--electric-lavender)] border-[var(--pale-gray)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Fine Queue"
        subtitle="Issue fines for confirmed violations"
      />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-[16px]" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Awaiting Fine</p>
            <p className="heading-xl mt-1" style={{ color: "var(--warning)" }}>{queuedClips.length}</p>
          </div>
          <div className="p-5 rounded-[16px]" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Fines Issued Today</p>
            <p className="heading-xl mt-1" style={{ color: "var(--success)" }}>{issuedFines.length}</p>
          </div>
          <div className="p-5 rounded-[16px]" style={{ background: "var(--parchment)" }}>
            <p className="label-md" style={{ color: "var(--ash)" }}>Total Value</p>
            <p className="heading-xl mt-1 gradient-text">₹{issuedFines.length * 500}</p>
          </div>
        </div>

        {queuedClips.length === 0 && issuedFines.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="heading-md mb-2">No violations in the queue</h3>
            <p className="body-md" style={{ color: "var(--ash)" }}>
              Confirmed violations will appear here for fine issuance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Clip list */}
            <div className="col-span-4">
              <h3 className="heading-sm mb-3">Confirmed Violations ({clips.length})</h3>
              <div className="space-y-2">
                {clips.map((clip, i) => {
                  const isIssued = issuedFines.includes(clip.id) || clip.fine_status === "ISSUED";
                  return (
                    <button
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className="w-full text-left p-4 rounded-[14px] transition-all duration-200 animate-fade-in"
                      style={{
                        background: selectedClipId === clip.id ? "rgba(168,85,247,0.08)" : "var(--parchment)",
                        border: selectedClipId === clip.id ? "1.5px solid var(--electric-lavender)" : "1.5px solid transparent",
                        cursor: "pointer",
                        opacity: isIssued ? 0.5 : 1,
                        animationDelay: `${i * 60}ms`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="heading-sm" style={{ color: "var(--ink)" }}>
                          Clip {clip.id.slice(-3)}
                        </span>
                        {isIssued ? (
                          <span className="badge badge-success">Fine Issued</span>
                        ) : (
                          <span className="badge badge-warning">Awaiting</span>
                        )}
                      </div>
                      <div className="flex gap-2 mb-1">
                        <ConfidenceBadge confidence={clip.ai_server_confidence} size="sm" />
                      </div>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>
                        {clip.ai_server_label === "RIGHT" ? "→ Right" : "← Left"} · {clip.recorded_at ? formatTime(clip.recorded_at) : ""}
                      </p>
                      {clip.review_note && (
                        <p className="body-sm mt-1 truncate" style={{ color: "var(--charcoal)" }}>
                          &ldquo;{clip.review_note}&rdquo;
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video + details */}
            <div className="col-span-8">
              {selectedClip ? (
                <div className="animate-fade-in" key={selectedClip.id}>
                  <ClipPlayer
                    videoUrl={selectedClip.video_url || ""}
                    autoPlay
                    loop
                  />

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-[16px]" style={{ background: "var(--parchment)" }}>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>Reviewer Notes</p>
                      <p className="body-md mt-1" style={{ color: "var(--charcoal)" }}>
                        {selectedClip.review_note || "No notes provided."}
                      </p>
                    </div>
                    <div className="p-4 rounded-[16px]" style={{ background: "var(--parchment)" }}>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>Violation Details</p>
                      <div className="mt-1 space-y-1">
                        <p className="body-sm">
                          <span style={{ color: "var(--ash)" }}>Direction: </span>
                          <span style={{ color: "var(--ink)" }}>{selectedClip.ai_server_label === "RIGHT" ? "Right" : "Left"} lane change</span>
                        </p>
                        <p className="body-sm">
                          <span style={{ color: "var(--ash)" }}>Server AI: </span>
                          <span style={{ color: "var(--ink)" }}>{selectedClip.ai_server_confidence ? `${Math.round(selectedClip.ai_server_confidence * 100)}%` : "N/A"}</span>
                        </p>
                        <p className="body-sm font-mono">
                          <span style={{ color: "var(--ash)" }}>GPS: </span>
                          <span style={{ color: "var(--ink)" }}>{selectedClip.gps_lat?.toFixed(4) ?? "0.0000"}, {selectedClip.gps_lng?.toFixed(4) ?? "0.0000"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Issue fine button */}
                  {!issuedFines.includes(selectedClip.id) && selectedClip.fine_status !== "ISSUED" ? (
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="btn-primary w-full mt-4"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      Issue Fine for This Violation
                    </button>
                  ) : (
                    <div
                      className="mt-4 p-4 rounded-[16px] text-center"
                      style={{ background: "rgba(111,207,151,0.08)", border: "1px solid rgba(111,207,151,0.2)" }}
                    >
                      <p className="heading-sm" style={{ color: "var(--success)" }}>
                        ✓ Fine has been issued for this violation
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="body-md" style={{ color: "var(--ash)" }}>Select a violation to review</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fine Issuance Drawer */}
      {selectedClip && (
        <FineIssuanceDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          clipId={selectedClip.id}
          onSubmit={handleIssueFine}
        />
      )}
    </div>
  );
}
