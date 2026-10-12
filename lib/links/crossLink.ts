"use client";

import { useEffect, useState } from "react";

/**
 * CR-1 (2026-09-24): shareable, two-way links between a surface card and a sport panel — e.g.
 * `#sports/badminton` or `#surfaces/acrylic`. The browser's own `hash` is the state (so a link
 * is a real, bookmarkable URL and works on a fresh page load, not just a click in the same
 * session); `hashchange` is the pub-sub mechanism, so no separate store is needed.
 *
 * A plain nav link (`#sports`, `#surfaces`, no slash) never matches `parseCrossLinkHash`, so it
 * is left alone — this only reacts to the two-part `#section/id` shape.
 */
export type CrossLinkSection = "surfaces" | "sports" | "projects";

export interface CrossLinkTarget {
  section: CrossLinkSection;
  id: string;
}

const HASH_PATTERN = /^#(surfaces|sports|projects)\/([a-z0-9-]+)$/;

/** `"#sports/badminton"` → `{ section: "sports", id: "badminton" }`; anything else → `null`. */
export function parseCrossLinkHash(hash: string): CrossLinkTarget | null {
  const match = HASH_PATTERN.exec(hash);
  return match ? { section: match[1] as CrossLinkSection, id: match[2] } : null;
}

export const surfaceHash = (id: string): string => `#surfaces/${id}`;
export const sportHash = (id: string): string => `#sports/${id}`;
export const projectHash = (id: string): string => `#projects/${id}`;

/**
 * Navigate to a cross-linked target. Setting a genuinely different hash fires the browser's
 * own `hashchange`, which `useCrossLinkTarget` below is listening for. Clicking the SAME chip
 * twice in a row would not otherwise fire it (the hash has not changed), so that case is
 * nudged with a synthetic event instead of forcing a hash-clear-and-reset dance.
 */
export function goToCrossLink(hash: string): void {
  if (typeof window === "undefined") return;
  if (window.location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = hash;
  }
}

/**
 * The pending cross-link id for one section, read on mount and on every `hashchange`. `null`
 * when the current hash is not a cross-link for this section (including a plain `#sports` nav
 * click, or a cross-link for the OTHER section).
 *
 * The consuming component (`Sports`, `CardCarousel`) reacts to the id changing (via its own
 * `useEffect` dependency) — there is no separate "already handled" flag here, because React's
 * own effect-dependency comparison already gives that for free: the same id will not re-fire
 * an effect unless the hash genuinely changes (or is nudged, see `goToCrossLink`) in between.
 */
export function useCrossLinkTarget(section: CrossLinkSection): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      const parsed = parseCrossLinkHash(window.location.hash);
      setId(parsed && parsed.section === section ? parsed.id : null);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [section]);
  return id;
}
