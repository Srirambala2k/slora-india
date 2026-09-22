"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cuePosition } from "@/lib/media/watermark";

interface WatermarkCoverProps {
  /** Largest radius in px. The button shrinks with the video, but never grows past this. */
  radius?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * A round element that sits exactly over the small ✦ mark baked into the stand-in footage.
 * Its parent must be the (positioned) box the video fills with `object-fit: cover`; the
 * position is recalculated whenever that box changes size. Delete this and its uses when
 * clean footage arrives.
 */
export function WatermarkCover({ radius = 90, className, children }: WatermarkCoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const place = () => {
      const cover = cuePosition(parent.clientWidth, parent.clientHeight, radius);
      el.style.width = el.style.height = `${cover.radius * 2}px`;
      el.style.left = `${cover.x - cover.radius}px`;
      el.style.top = `${cover.y - cover.radius}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [radius]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "absolute", width: radius * 2, height: radius * 2 }}
      aria-hidden={children ? undefined : true}
    >
      {children}
    </div>
  );
}
