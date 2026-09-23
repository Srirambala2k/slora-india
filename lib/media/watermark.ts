/**
 * Where the small ✦ mark that is baked into the stand-in footage sits, as a fraction of
 * the 16:9 video frame. The site shows the frame `object-fit: cover`, so where that spot
 * lands on screen depends on the screen shape. The round buttons that sit over it hide it.
 * When clean footage arrives this whole file can go.
 */
export const WATERMARK = { x: 0.906, y: 0.833, aspect: 16 / 9 } as const;

/**
 * How big the round cover needs to be, as a fraction of the frame's width.
 *
 * Measured directly from the footage (`public/videos/slora-hero-poster.webp`, a real frame,
 * cropped and zoomed for inspection): the ✦ mark's own points reach about 0.02 of the frame's
 * width from its centre. This is set noticeably above that (≈40% margin) so a slightly-off
 * centre, sub-pixel rounding at odd window sizes, or anti-aliasing at the button's edge never
 * lets a point peek out (reported: it did, on a big-monitor window — see the radius cap below).
 */
const COVER_RADIUS_PER_FRAME_WIDTH = 0.028;

/** Where the mark lands (px from the top-left) when the frame is `cover`-fitted into width × height. */
export function watermarkOnScreen(
  width: number,
  height: number,
): { x: number; y: number; frameWidth: number } {
  let frameW: number;
  let frameH: number;
  let cropX = 0;
  let cropY = 0;
  if (width / height > WATERMARK.aspect) {
    // Screen is wider than the video: scaled to the width, top and bottom are cropped.
    frameW = width;
    frameH = width / WATERMARK.aspect;
    cropY = (frameH - height) / 2;
  } else {
    // Screen is taller/narrower: scaled to the height, left and right are cropped.
    frameH = height;
    frameW = height * WATERMARK.aspect;
    cropX = (frameW - width) / 2;
  }
  return {
    x: WATERMARK.x * frameW - cropX,
    y: WATERMARK.y * frameH - cropY,
    frameWidth: frameW,
  };
}

/**
 * Centre and size for the round button: over the mark when it is comfortably on screen,
 * otherwise (tall phone screens crop it away) tucked into the bottom-right corner, just above
 * the floating chat button.
 *
 * The button is only as big as it needs to be: the mark shrinks with the video, so on smaller
 * windows the button shrinks too, which keeps it well clear of the chat button.
 */
export function cuePosition(
  width: number,
  height: number,
  maxRadius = 90,
): { x: number; y: number; radius: number; overMark: boolean } {
  const { x, y, frameWidth } = watermarkOnScreen(width, height);
  // Below this frame width the button uses `COVER_RADIUS_PER_FRAME_WIDTH` as-is; above it, the
  // button stops growing at `maxRadius` (so it never gets huge on a big monitor) — but that cap
  // must stay above the mark's own real size even at the widest frame this is likely to see, or
  // the mark starts peeking out again exactly like the ratio was too small in the first place.
  const radius = Math.min(
    maxRadius,
    Math.max(Math.min(32, maxRadius), frameWidth * COVER_RADIUS_PER_FRAME_WIDTH),
  );
  const margin = 8;
  const onScreen =
    x >= radius + margin &&
    y >= radius + margin &&
    x <= width - radius - margin &&
    y <= height - radius - margin;
  if (onScreen) return { x, y, radius, overMark: true };

  // Off screen (a narrow, tall phone crops the mark away entirely): there is nothing left to
  // hide, so this is just an ordinary corner button — sized to the SCREEN, not to `maxRadius`
  // (a desktop-appropriate cap that would otherwise make it as wide as a small phone screen).
  const fallbackRadius = Math.min(maxRadius, Math.max(32, Math.min(width, height) * 0.11));
  return {
    x: width - fallbackRadius - 16,
    y: height - fallbackRadius - 96,
    radius: fallbackRadius,
    overMark: false,
  };
}
