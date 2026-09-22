import { useSyncExternalStore } from "react";

/**
 * Where the opening sequence is (master prompt §6). One small shared store lets the
 * entrance, the header and the hero start their animations in the right order
 * without importing each other.
 *
 *   entering  → black screen, logo assembling
 *   revealing → logo has docked; the site is wiping in from the right
 *   ready     → everything settled; scrolling is unlocked
 */
export type Stage = "entering" | "revealing" | "ready";

let stage: Stage = "entering";
const listeners = new Set<() => void>();

export function getStage(): Stage {
  return stage;
}

/**
 * "Warm-up": a signal, sent during the intro's quiet moment (the logo holds still), that the
 * heavy 3D scene can start setting itself up. Doing that work THEN means the brief stall it
 * causes happens while nothing is moving, instead of while the visitor starts to scroll.
 */
let warm = false;

export function requestWarmup(): void {
  if (warm) return;
  warm = true;
  listeners.forEach((listener) => listener());
}

export function useWarm(): boolean {
  return useSyncExternalStore(
    subscribeStage,
    () => warm,
    () => false,
  );
}

/** Mirror the stage onto <html data-stage> so CSS can react (e.g. lock scrolling). */
export function syncStageAttribute(): void {
  if (typeof document !== "undefined") document.documentElement.dataset.stage = stage;
}

export function setStage(next: Stage): void {
  if (next === stage) return;
  stage = next;
  syncStageAttribute();
  listeners.forEach((listener) => listener());
}

/** Subscribe to stage changes; returns an unsubscribe function. */
export function subscribeStage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Server and first client render always see "entering", so hydration matches. */
export function useStage(): Stage {
  return useSyncExternalStore(subscribeStage, getStage, () => "entering");
}
