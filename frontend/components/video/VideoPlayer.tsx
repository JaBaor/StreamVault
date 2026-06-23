"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Episode } from "@/lib/types";

interface VideoPlayerProps {
  episode: Episode;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  initialProgress?: number;
}

function getEmbedUrl(url: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "abyssplayer.com" || host === "abyss.to") {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

export function VideoPlayer({
  episode,
  onProgress,
  onEnded,
  initialProgress = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const embedUrl = getEmbedUrl(episode.videoUrl);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !initialProgress) return;
    const setTime = () => {
      if (v.duration && initialProgress > 0) {
        v.currentTime = (initialProgress / 100) * v.duration;
      }
    };
    v.addEventListener("loadedmetadata", setTime);
    return () => v.removeEventListener("loadedmetadata", setTime);
  }, [episode.id, initialProgress]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
    resetHideTimer();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    onProgress?.((v.currentTime / v.duration) * 100);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = (Number(e.target.value) / 100) * duration;
    v.currentTime = t;
    setCurrentTime(t);
    resetHideTimer();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  if (!episode.videoUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-black px-6 text-center text-sm text-zinc-400">
        This title does not have a playable video URL yet.
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={embedUrl}
          title={episode.title}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          scrolling="no"
        />
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      <video
        ref={videoRef}
        key={episode.id}
        className="h-full w-full"
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onClick={togglePlay}
      >
        <source src={episode.videoUrl} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>

      <div
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="pointer-events-auto px-3 pb-3 pt-8 sm:px-4 sm:pb-4">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progressPct}
            onChange={seek}
            className="sv-range mb-2 w-full cursor-pointer"
            aria-label="Seek"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-lg p-2 text-white hover:bg-white/20"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-zinc-300 sm:text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  setVolume(vol);
                  if (videoRef.current) videoRef.current.volume = vol;
                }}
                className="sv-range hidden w-20 sm:block"
                aria-label="Volume"
              />
              <button
                type="button"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  if (document.fullscreenElement) void document.exitFullscreen();
                  else void v.requestFullscreen();
                }}
                className="rounded-lg p-2 text-white hover:bg-white/20"
                aria-label="Fullscreen"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          aria-label="Play video"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sv-orange)] text-white shadow-xl sm:h-20 sm:w-20">
            <svg className="ml-1 h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
