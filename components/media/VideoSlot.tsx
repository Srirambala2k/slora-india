"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { videos, type MediaSource, type VideoId } from "@/data/media";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

interface VideoSlotProps {
  id: VideoId;
  className?: string;
  /** Start loading immediately (hero). Otherwise the file is only fetched near the viewport. */
  eager?: boolean;
  /** Decorative background video (default). Set false to expose the label to screen readers. */
  decorative?: boolean;
  /** Show a small "illustrative footage" note while the footage is a stand-in. */
  showProvenance?: boolean;
  /** Rendered inside the same positioned box the video fills (e.g. a `WatermarkCover`). */
  children?: ReactNode;
}

/**
 * Lazy, poster-first, motion-safe video (master prompt §39, §41).
 *  - the poster paints first (this is the LCP element on the hero);
 *  - the video file is only requested once the slot is near the viewport;
 *  - it pauses while off-screen;
 *  - with `prefers-reduced-motion` it never loads — the poster stays.
 */
export function VideoSlot({
  id,
  className = "",
  eager = false,
  decorative = true,
  showProvenance = false,
  children,
}: VideoSlotProps) {
  const media = videos[id];
  const sources: readonly MediaSource[] = media.sources;
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [near, setNear] = useState(eager);
  const [inView, setInView] = useState(eager);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof IntersectionObserver === "undefined") return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    const viewObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    nearObserver.observe(box);
    viewObserver.observe(box);
    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) {
      // Autoplay can be refused by the browser; the poster simply stays in that case.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [inView, near, reducedMotion]);

  const loadVideo = near && !reducedMotion;

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden bg-ink ${className}`}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": media.label })}
    >
      <Image
        src={media.poster}
        alt=""
        fill
        sizes="100vw"
        priority={eager}
        className="object-cover"
      />

      {loadVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          muted
          loop
          playsInline
          autoPlay
          preload={eager ? "auto" : "metadata"}
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} media={source.media} />
          ))}
        </video>
      )}

      {showProvenance && media.provenance === "illustrative" && (
        <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.2em] text-paper/60">
          ILLUSTRATIVE FOOTAGE
        </span>
      )}

      {children}
    </div>
  );
}
