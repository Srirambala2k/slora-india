import {
  coarseIndices,
  frameAt,
  nextToFetch,
  paintPlan,
  pickFrames,
  windowIndices,
} from "./frameMath";

/**
 * Scroll-driven footage made of still frames painted onto a <canvas>.
 *
 * Why not a scrubbed <video>? Every scroll step forces the browser to SEEK and DECODE video,
 * which stalls (it looks like "buffering") whenever the decoder cannot keep up, most of all on
 * computers without fast video decoding. Painting an already-decoded still frame takes a
 * fraction of a millisecond and cannot stall, however fast you scroll.
 *
 * How it stays light:
 *   - frames download as small compressed images, spread-out ones first, then those nearest
 *     to where you are;
 *   - only a small window of frames around the current position is kept decoded in memory
 *     (plus the spread-out ones), the rest are freed;
 *   - between two frames the canvas blends them, so slow scrolling glides instead of stepping;
 *   - the canvas is redrawn at most once per screen refresh, and never when it would look the
 *     same. This matters: every full-screen draw costs the graphics card work, and when a card
 *     falls behind, the browser freezes the page until it catches up (the very stall this
 *     replaces video to avoid).
 */
export interface FrameSequence {
  /** Start downloading frames (safe to call more than once). */
  start(): void;
  /** Paint the picture for a 0 → 1 position along the footage. Cheap to call every frame. */
  draw(position: number): void;
  /** True once at least one frame can be painted. */
  ready(): boolean;
  destroy(): void;
}

interface Options {
  canvas: HTMLCanvasElement;
  urls: readonly string[];
  /** Cap on the canvas's pixel ratio (sharp on scaled screens without huge memory use). */
  maxDpr?: number;
  /** Cap on the canvas's width in pixels: more than the frames themselves hold is wasted work. */
  maxWidth?: number;
  /** Called once, when the first frame becomes paintable. */
  onReady?: () => void;
}

const MAX_FETCHES = 4;
const MAX_DECODES = 3;

export function createFrameSequence({
  canvas,
  urls,
  maxDpr = 1.5,
  maxWidth = 1440,
  onReady,
}: Options): FrameSequence {
  const count = urls.length;
  const coarse = coarseIndices(count);
  const keep = new Set(coarse);
  const blobs: Array<Blob | null> = new Array(count).fill(null);
  const bitmaps: Array<ImageBitmap | null> = new Array(count).fill(null);
  const fetching = new Set<number>();
  const decoding = new Set<number>();
  const failed = new Set<number>(); // frames that could not be loaded/decoded: skipped, never retried
  const abort = new AbortController();
  const ctx = canvas.getContext("2d", { alpha: false });

  let position = 0;
  let direction: -1 | 0 | 1 = 0;
  let started = false;
  let destroyed = false;
  let anyReady = false;
  let width = 0;
  let height = 0;
  let painted = ""; // what the canvas currently shows (see paint); "" = nothing / cleared
  let repaintQueued = 0; // requestAnimationFrame handle, 0 = none

  const f = () => frameAt(position, count);
  const hasBitmap = (i: number) => bitmaps[i] !== null;

  /** Size the canvas to its on-screen size (× pixel ratio, capped). */
  function resize() {
    if (canvas.clientWidth === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.min(maxWidth, Math.round(canvas.clientWidth * dpr)));
    const h = Math.max(1, Math.round((w * canvas.clientHeight) / canvas.clientWidth));
    if (w === width && h === height) return;
    canvas.width = width = w;
    canvas.height = height = h;
    painted = ""; // resizing clears the canvas
    paint();
  }

  /** object-fit: cover, done by hand. */
  function drawCover(image: ImageBitmap, alpha: number) {
    if (!ctx) return;
    const scale = Math.max(width / image.width, height / image.height);
    const sw = width / scale;
    const sh = height / scale;
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      image,
      (image.width - sw) / 2,
      (image.height - sh) / 2,
      sw,
      sh,
      0,
      0,
      width,
      height,
    );
  }

  /** Draw what the current position calls for, unless the canvas already shows exactly that. */
  function paint() {
    if (!ctx || width === 0) return;
    const pick = pickFrames(hasBitmap, f(), count);
    if (!pick) return;
    const plan = paintPlan(pick);
    const key = `${plan.first}|${plan.second ?? ""}|${plan.alpha}`;
    if (key === painted) return;
    const first = bitmaps[plan.first];
    if (!first) return;
    drawCover(first, 1);
    if (plan.second !== null) {
      const second = bitmaps[plan.second];
      if (second) drawCover(second, plan.alpha);
    }
    ctx.globalAlpha = 1;
    painted = key;
    if (!anyReady) {
      anyReady = true;
      onReady?.();
    }
  }

  /** For changes that are not the visitor scrolling (a frame finished decoding): at most one redraw per screen refresh. */
  function queuePaint() {
    if (repaintQueued || destroyed) return;
    repaintQueued = requestAnimationFrame(() => {
      repaintQueued = 0;
      paint();
    });
  }

  /** Decode what is wanted, free what is not. */
  function manageMemory() {
    const wanted = new Set<number>(keep);
    const window = windowIndices(f(), count, direction);
    for (const i of window) wanted.add(i);

    for (let i = 0; i < count; i++) {
      const bitmap = bitmaps[i];
      if (bitmap && !wanted.has(i)) {
        bitmap.close();
        bitmaps[i] = null;
      }
    }
    for (const i of [...window, ...coarse]) {
      if (decoding.size >= MAX_DECODES) break;
      const blob = blobs[i];
      if (!blob || bitmaps[i] || decoding.has(i) || failed.has(i)) continue;
      decoding.add(i);
      createImageBitmap(blob)
        .then((bitmap) => {
          decoding.delete(i);
          if (destroyed || !wantedNow(i)) {
            bitmap.close();
          } else {
            bitmaps[i] = bitmap;
            queuePaint();
          }
          manageMemory();
        })
        .catch(() => {
          decoding.delete(i);
          failed.add(i);
        });
    }
  }

  function wantedNow(i: number): boolean {
    return keep.has(i) || windowIndices(f(), count, direction).includes(i);
  }

  /** Keep a few downloads going, always choosing the most useful missing frame. */
  function pump() {
    if (destroyed || !started) return;
    while (fetching.size < MAX_FETCHES) {
      const i = nextToFetch(
        (x) => blobs[x] !== null,
        (x) => fetching.has(x),
        f(),
        count,
        coarse,
      );
      if (i === null) return;
      fetching.add(i);
      fetch(urls[i], { signal: abort.signal })
        .then((response) => (response.ok ? response.blob() : Promise.reject(new Error("bad"))))
        .then((blob) => {
          blobs[i] = blob;
          fetching.delete(i);
          manageMemory();
          pump();
        })
        .catch(() => {
          fetching.delete(i);
          // a frame that fails to load is simply skipped; the neighbours cover for it
          failed.add(i);
          blobs[i] = new Blob();
          pump();
        });
    }
  }

  const observer =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
  observer?.observe(canvas);
  window.addEventListener("resize", resize);
  resize();

  return {
    start() {
      if (started || destroyed) return;
      started = true;
      pump();
    },
    draw(next) {
      const before = position;
      position = Math.min(1, Math.max(0, next));
      if (position !== before) direction = position > before ? 1 : -1;
      manageMemory();
      pump(); // re-aim the downloads at where the visitor is now
      paint();
    },
    ready: () => anyReady,
    destroy() {
      destroyed = true;
      if (repaintQueued) cancelAnimationFrame(repaintQueued);
      abort.abort();
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      bitmaps.forEach((bitmap) => bitmap?.close());
      bitmaps.fill(null);
    },
  };
}
