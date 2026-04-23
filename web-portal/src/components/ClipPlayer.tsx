"use client";

import { useState, useRef, useEffect } from "react";
import AiEvidenceOverlay from "./AiEvidenceOverlay";

interface ClipPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  clipDurationMs?: number;
  autoPlay?: boolean;
  loop?: boolean;
  direction?: string | null;
  evidenceFrames?: {
    frame_ms: number;
    bbox: [number, number, number, number];
    label: string;
    confidence: number;
  }[];
}

export default function ClipPlayer({
  videoUrl,
  autoPlay = false,
  loop = true,
  direction,
  evidenceFrames = [],
}: ClipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showEvidence, setShowEvidence] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => { if (!loop) setIsPlaying(false); };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [loop]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const cycleSpeed = () => {
    const video = videoRef.current;
    const rates = [0.5, 1, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (video) video.playbackRate = next;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-[16px] overflow-hidden" style={{ background: "var(--ink)" }}>
      {/* Video Element */}
      <div className="relative aspect-video cursor-pointer group" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          playsInline
          className="w-full h-full object-cover"
          poster=""
        />

        {/* AI Evidence Overlay */}
        <AiEvidenceOverlay
          currentTimeMs={currentTime * 1000}
          evidenceFrames={evidenceFrames}
          isVisible={showEvidence}
          direction={direction}
        />

        {/* Play/Pause Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
          <div className="w-14 h-14 rounded-full glass-card flex items-center justify-center">
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </div>
        </div>

        {/* Duration badge */}
        {duration > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-white text-xs font-medium"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Play/Pause btn */}
        <button onClick={togglePlay} className="text-white hover:text-[var(--blossom-pink)] transition-colors">
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Time display */}
        <span className="text-white/70 text-xs font-mono min-w-[40px]">
          {formatTime(currentTime)}
        </span>

        {/* Scrubber with evidence frame markers */}
        <div className="flex-1 relative group">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--blossom-pink) 0%, var(--lavender-mist) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
          {/* Evidence frame tick marks */}
          {duration > 0 && evidenceFrames.map((frame, i) => {
            const pct = (frame.frame_ms / 1000 / duration) * 100;
            if (pct < 0 || pct > 100) return null;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-2.5 rounded-full"
                style={{
                  left: `${pct}%`,
                  background: "var(--electric-lavender)",
                  boxShadow: "0 0 4px var(--electric-lavender)",
                  pointerEvents: "none",
                  opacity: 0.7,
                }}
              />
            );
          })}
        </div>

        {/* Duration */}
        <span className="text-white/70 text-xs font-mono min-w-[40px] text-right">
          {formatTime(duration)}
        </span>

        {/* Mute toggle */}
        <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-[var(--blossom-pink)] transition-colors" title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" x2="17" y1="9" y2="15" />
              <line x1="17" x2="23" y1="9" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* Speed Toggle */}
        <button
          onClick={cycleSpeed}
          className="text-white/70 hover:text-white transition-colors text-xs font-bold font-mono min-w-[28px] text-center"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {/* Evidence Toggle */}
        {evidenceFrames.length > 0 && (
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-white hover:text-[var(--blossom-pink)] transition-colors"
            title={showEvidence ? "Hide AI Evidence" : "Show AI Evidence"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showEvidence ? "var(--electric-lavender)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
