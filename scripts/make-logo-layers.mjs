#!/usr/bin/env node
/**
 * INTERIM logo layers for the entrance animation.
 *
 * The only logo we have is a 508×264 PNG (photo/slora_logo.png) sitting on black
 * satin. This script cuts it into four transparent layers of IDENTICAL size, so
 * they can be stacked exactly where they were and animated independently:
 *
 *   bar-1 (white) · bar-2 (white) · bar-3 (gold) · wordmark
 *
 * Output: public/images/logo/*.webp (960×368 each, upscaled 4× with Lanczos, with alpha).
 *
 * This is a stop-gap: it is a raster, so it softens if shown much larger than
 * ~480 px wide. REPLACE with the official vector logo (SVG/AI) when SLORA supplies
 * it (plan §8 #2); only components/brand/Brand.tsx needs to change.
 *
 *   npm run assets:logo
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "photo", "slora_logo.png");
const OUT = join(ROOT, "public", "images", "logo");

// Crop of the original artwork that contains the whole logo (x, y, w, h), then ×4.
const CROP = "crop=240:92:110:62";
const SCALE = 4;

// Row bands (in source pixels, relative to the crop top) that hold each layer.
const layers = [
  { name: "bar-1", rows: [0, 19] },
  { name: "bar-2", rows: [19, 33] },
  { name: "bar-3", rows: [33, 55] },
  { name: "wordmark", rows: [55, 92] },
];

// Luminance → alpha: fully transparent on the dark satin, fully opaque on white/gold.
const LUM = "(0.2126*r(X,Y)+0.7152*g(X,Y)+0.0722*b(X,Y))";
const ALPHA = `clip((${LUM}-95)*255/60,0,255)`;

mkdirSync(OUT, { recursive: true });

for (const { name, rows } of layers) {
  const [y0, y1] = rows.map((r) => r * SCALE);
  const filter = [
    CROP,
    `scale=iw*${SCALE}:ih*${SCALE}:flags=lanczos`,
    "format=gbrap",
    `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='${ALPHA}*gte(Y,${y0})*lt(Y,${y1})'`,
  ].join(",");
  const target = join(OUT, `${name}.webp`);
  const res = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-v",
      "error",
      "-i",
      SRC,
      "-vf",
      filter,
      "-c:v",
      "libwebp",
      "-quality",
      "92",
      "-compression_level",
      "6",
      "-pix_fmt",
      "yuva420p",
      "-frames:v",
      "1",
      target,
    ],
    {
      stdio: "inherit",
    },
  );
  if (res.status !== 0) {
    console.error(`ffmpeg failed for ${name}`);
    process.exit(1);
  }
  console.log(`wrote ${name}.webp`);
}
