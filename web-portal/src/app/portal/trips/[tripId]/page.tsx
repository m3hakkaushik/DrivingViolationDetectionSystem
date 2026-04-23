"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Header from "@/components/layout/Header";
import ClipPlayer from "@/components/ClipPlayer";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import ReviewDecisionPanel from "@/components/ReviewDecisionPanel";
import GpsMapPin from "@/components/GpsMapPin";
import { formatDate, formatTime, formatDuration, formatTimestamp } from "@/lib/utils";
import { getTrip, getTripClips, submitClipReview, rerunAiAnalysis } from "@/services/api";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tripId = params.tripId as string;

  const { data: trip, isLoading: isTripLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTrip(tripId),
  });

  const { data: clips = [], isLoading: isClipsLoading } = useQuery({
    queryKey: ["clips", tripId],
    queryFn: () => getTripClips(tripId),
  });

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [rerunPending, setRerunPending] = useState(false);

  // Auto-select first clip when loaded
  useMemo(() => {
    if (clips.length > 0 && !selectedClipId) {
      setSelectedClipId(clips[0].id);
    }
  }, [clips, selectedClipId]);

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  const reviewMutation = useMutation({
    mutationFn: ({ clipId, decision, note }: { clipId: string; decision: "CONFIRMED" | "REJECTED"; note: string }) =>
      submitClipReview(clipId, decision, note),
    onSuccess: (updatedClip) => {
      // Optimistically update the cache
      queryClient.setQueryData(["clips", tripId], (oldClips: any) =>
        oldClips.map((c: any) => (c.id === updatedClip.id ? updatedClip : c))
      );

      // Auto-select next pending clip
      const nextPending = clips.find(
        (c) => c.id !== updatedClip.id && c.review_status === "PENDING"
      );
      if (nextPending) {
        setSelectedClipId(nextPending.id);
      }
    },
  });

  if (isTripLoading || isClipsLoading) {
    return (
      <div>
        <Header title="Trip Details" />
        <div className="p-16 flex justify-center">
           <div className="w-8 h-8 border-4 border-t-[var(--electric-lavender)] border-[var(--pale-gray)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div>
        <Header title="Trip not found" />
        <div className="p-8 text-center">
          <p className="body-lg" style={{ color: "var(--ash)" }}>
            We couldn&apos;t find that trip. It may have been removed.
          </p>
          <button onClick={() => router.push("/portal/trips")} className="btn-secondary mt-4">
            Back to trips
          </button>
        </div>
      </div>
    );
  }

  const handleDecision = (decision: "CONFIRMED" | "REJECTED", note: string) => {
    if (!selectedClip) return;
    reviewMutation.mutate({ clipId: selectedClip.id, decision, note });
  };

  const handleRerunAi = async () => {
    if (!selectedClip || rerunPending) return;
    setRerunPending(true);
    try {
      await rerunAiAnalysis(selectedClip.id);
      // Refetch clips after a delay to pick up new AI results
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["clips", tripId] });
        setRerunPending(false);
      }, 3000);
    } catch {
      setRerunPending(false);
    }
  };

  const pendingCount = clips.filter((c) => c.review_status === "PENDING").length;
  const confirmedCount = clips.filter((c) => c.review_status === "CONFIRMED").length;
  const rejectedCount = clips.filter((c) => c.review_status === "REJECTED").length;

  return (
    <div>
      <Header
        title={`Trip · ${formatDate(trip.started_at)}`}
        subtitle={`${trip.user_name} · ${formatDuration(trip.duration_ms)} · ${trip.device_model}`}
      />

      <div className="p-8">
        {/* Progress bar */}
        <div className="mb-6 p-4 rounded-[16px]" style={{ background: "var(--parchment)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="label-md" style={{ color: "var(--ash)" }}>Review Progress</span>
            <div className="flex gap-3">
              <span className="badge badge-info">{pendingCount} pending</span>
              <span className="badge badge-success">{confirmedCount} confirmed</span>
              <span className="badge badge-error">{rejectedCount} rejected</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: "var(--pale-gray)" }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((confirmedCount + rejectedCount) / clips.length) * 100}%`,
                background: "linear-gradient(90deg, var(--success), var(--electric-lavender))",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Clip list sidebar */}
          <div className="col-span-3">
            <h3 className="heading-sm mb-3">Clips ({clips.length})</h3>
            <div className="space-y-2">
              {clips.map((clip, i) => (
                <button
                  key={clip.id}
                  onClick={() => setSelectedClipId(clip.id)}
                  className="w-full text-left p-3 rounded-[14px] transition-all duration-200 animate-fade-in"
                  style={{
                    background: selectedClipId === clip.id ? "rgba(168,85,247,0.08)" : "var(--parchment)",
                    border: selectedClipId === clip.id ? "1.5px solid var(--electric-lavender)" : "1.5px solid transparent",
                    cursor: "pointer",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="label-md" style={{ color: "var(--ink)" }}>
                      Clip {i + 1}
                    </span>
                    {clip.review_status === "CONFIRMED" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                    {clip.review_status === "REJECTED" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge
                      confidence={clip.timestamp_source === "AI" ? clip.ai_device_confidence : null}
                      source={clip.timestamp_source}
                      size="sm"
                    />
                  </div>
                  <p className="label-sm mt-1" style={{ color: "var(--ash)" }}>
                    {formatTimestamp(clip.video_offset_ms ?? 0)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-6">
            {selectedClip ? (
              <div className="animate-fade-in" key={selectedClip.id}>
                <ClipPlayer
                  videoUrl={selectedClip.video_url || ""}
                  thumbnailUrl={selectedClip.thumbnail_url || ""}
                  clipDurationMs={selectedClip.clip_duration_ms ?? 0}
                  evidenceFrames={selectedClip.evidence_frames_list ?? []}
                  direction={selectedClip.ai_server_label}
                  autoPlay
                  loop
                />

                {/* AI Analysis Results Panel */}
                {selectedClip.timestamp_source === "AI" && (
                  <div
                    className="mt-3 p-4 rounded-[16px] animate-fade-in"
                    style={{
                      background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(201,184,240,0.06) 100%)",
                      border: "1px solid rgba(168,85,247,0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {/* AI icon */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(168,85,247,0.12)" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--electric-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                          </svg>
                        </div>
                        <span className="heading-sm" style={{ color: "var(--electric-lavender)" }}>AI Analysis</span>
                        {selectedClip.evidence_frames_list && selectedClip.evidence_frames_list.length > 0 && (
                          <span className="badge badge-lavender">{selectedClip.evidence_frames_list.length} detections</span>
                        )}
                      </div>
                      <button
                        onClick={handleRerunAi}
                        disabled={rerunPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: rerunPending ? "var(--pale-gray)" : "rgba(168,85,247,0.1)",
                          border: "1px solid rgba(168,85,247,0.25)",
                          color: rerunPending ? "var(--ash)" : "var(--electric-lavender)",
                          cursor: rerunPending ? "not-allowed" : "pointer",
                        }}
                      >
                        {rerunPending ? (
                          <>
                            <div className="w-3 h-3 border-2 border-t-[var(--electric-lavender)] border-[var(--pale-gray)] rounded-full animate-spin" />
                            Running…
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                              <path d="M3 3v5h5"/>
                            </svg>
                            Re-run AI
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Direction */}
                      {selectedClip.ai_server_label && (
                        <div
                          className="p-3 rounded-[12px] flex items-center gap-3"
                          style={{ background: "rgba(255,255,255,0.5)" }}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
                            style={{
                              background: selectedClip.ai_server_label === "RIGHT"
                                ? "rgba(168,85,247,0.15)"
                                : "rgba(239,68,68,0.12)",
                              color: selectedClip.ai_server_label === "RIGHT"
                                ? "var(--electric-lavender)"
                                : "var(--error)",
                            }}
                          >
                            {selectedClip.ai_server_label === "RIGHT" ? "→" : "←"}
                          </div>
                          <div>
                            <p className="label-sm" style={{ color: "var(--ash)" }}>Direction</p>
                            <p className="body-sm font-semibold mt-0.5" style={{ color: "var(--ink)" }}>
                              {selectedClip.ai_server_label === "RIGHT" ? "Right" : "Left"} Lane Change
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Server Confidence */}
                      {selectedClip.ai_server_confidence !== null && (
                        <div
                          className="p-3 rounded-[12px]"
                          style={{ background: "rgba(255,255,255,0.5)" }}
                        >
                          <p className="label-sm mb-1.5" style={{ color: "var(--ash)" }}>Server Confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--pale-gray)" }}>
                              <div
                                className="h-1.5 rounded-full transition-all duration-700"
                                style={{
                                  width: `${(selectedClip.ai_server_confidence ?? 0) * 100}%`,
                                  background: "linear-gradient(90deg, var(--lavender-mist), var(--electric-lavender))",
                                }}
                              />
                            </div>
                            <span className="label-md font-bold" style={{ color: "var(--electric-lavender)", minWidth: "36px" }}>
                              {((selectedClip.ai_server_confidence ?? 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          {selectedClip.ai_device_confidence !== null && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1 rounded-full" style={{ background: "var(--pale-gray)" }}>
                                <div
                                  className="h-1 rounded-full"
                                  style={{
                                    width: `${(selectedClip.ai_device_confidence ?? 0) * 100}%`,
                                    background: "var(--blossom-pink)",
                                  }}
                                />
                              </div>
                              <span className="label-sm" style={{ color: "var(--ash)", minWidth: "36px" }}>
                                {((selectedClip.ai_device_confidence ?? 0) * 100).toFixed(0)}% <span style={{ fontSize: "9px" }}>DEV</span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clip info */}

                <div className="mt-4 p-4 rounded-[16px]" style={{ background: "var(--parchment)" }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>Source</p>
                      <div className="mt-1">
                        <ConfidenceBadge
                          confidence={selectedClip.timestamp_source === "AI" ? selectedClip.ai_device_confidence : null}
                          source={selectedClip.timestamp_source}
                        />
                      </div>
                    </div>
                    {selectedClip.ai_server_confidence !== null && (
                      <div>
                        <p className="label-sm" style={{ color: "var(--ash)" }}>Server AI</p>
                        <div className="mt-1">
                          <ConfidenceBadge confidence={selectedClip.ai_server_confidence} />
                        </div>
                      </div>
                    )}
                    {selectedClip.ai_server_label && (
                      <div>
                        <p className="label-sm" style={{ color: "var(--ash)" }}>Direction</p>
                        <p className="heading-sm mt-1" style={{ color: "var(--ink)" }}>
                          {selectedClip.ai_server_label === "RIGHT" ? "→ Right" : "← Left"} lane change
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>GPS</p>
                      <p className="body-sm mt-1 font-mono" style={{ color: "var(--charcoal)" }}>
                        {selectedClip.gps_lat?.toFixed(4) ?? "0.0000"}, {selectedClip.gps_lng?.toFixed(4) ?? "0.0000"}
                      </p>
                    </div>
                    <div>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>Recorded</p>
                      <p className="body-sm mt-1" style={{ color: "var(--charcoal)" }}>
                        {selectedClip.recorded_at ? formatTime(selectedClip.recorded_at) : ""}
                      </p>
                    </div>
                    <div>
                      <p className="label-sm" style={{ color: "var(--ash)" }}>Offset</p>
                      <p className="body-sm mt-1 font-mono" style={{ color: "var(--charcoal)" }}>
                        {formatTimestamp(selectedClip.video_offset_ms ?? 0)}
                      </p>
                    </div>
                  </div>

                  {/* Map Pin */}
                  <div className="mt-6">
                    <p className="label-sm mb-2" style={{ color: "var(--ash)" }}>Location</p>
                    <GpsMapPin
                      lat={selectedClip.gps_lat ?? 0}
                      lng={selectedClip.gps_lng ?? 0}
                      height="180px"
                    />
                  </div>
                </div>

                {/* Review note if already decided */}
                {selectedClip.review_status !== "PENDING" && (
                  <div
                    className="mt-4 p-4 rounded-[16px] animate-fade-in"
                    style={{
                      background: selectedClip.review_status === "CONFIRMED"
                        ? "rgba(111,207,151,0.08)"
                        : "rgba(235,87,87,0.08)",
                      border: `1px solid ${selectedClip.review_status === "CONFIRMED" ? "rgba(111,207,151,0.2)" : "rgba(235,87,87,0.2)"}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {selectedClip.review_status === "CONFIRMED" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                      )}
                      <span className="heading-sm" style={{ color: selectedClip.review_status === "CONFIRMED" ? "var(--success)" : "var(--error)" }}>
                        {selectedClip.review_status === "CONFIRMED" ? "Violation Confirmed" : "Rejected"}
                      </span>
                    </div>
                    {selectedClip.review_note && (
                      <p className="body-md" style={{ color: "var(--charcoal)" }}>
                        {selectedClip.review_note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="body-md" style={{ color: "var(--ash)" }}>Select a clip to review</p>
              </div>
            )}
          </div>

          {/* Decision panel */}
          <div className="col-span-3">
            {selectedClip && selectedClip.review_status === "PENDING" ? (
              <ReviewDecisionPanel
                clipId={selectedClip.id}
                onDecision={handleDecision}
              />
            ) : selectedClip ? (
              <div className="card" style={{ background: "var(--cloud-white)" }}>
                <h3 className="heading-sm mb-2">Decision made</h3>
                <p className="body-sm" style={{ color: "var(--ash)" }}>
                  This clip has already been {selectedClip.review_status.toLowerCase()}.
                  {selectedClip.fine_status === "QUEUED" && " It's been sent to the fine queue."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
