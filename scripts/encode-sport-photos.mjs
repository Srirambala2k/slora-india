#!/usr/bin/env node
/**
 * SLORA sports panel backgrounds (2026-10-01).
 *
 * Converts the client's AI-generated sport photos (`photo/photos_sports/<sport>.jpg`, one per
 * Sports panel) into web-ready stills (`public/images/sports/<sport>.webp`). Originals are never
 * modified.
 *
 *   npm run assets:encode:sports            convert every sport listed below
 *   npm run assets:encode:sports -- --check only check the output files exist and fit budget
 *
 * Requires `ffmpeg` on PATH. The generator's sparkle watermark sits in the bottom-right corner
 * ; it is painted over with ffmpeg's
 * `delogo` before scaling. The pictures still show in-image signage text ("PERFECT TURF", "ULTRAFLOORING",
 * "PRO-COURT") — AI-invented, but check none is a real company's name before a public launch.
 * All are `illustrative` (AI-generated stand-ins), never a specific SLORA project.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "photo", "photos_sports");
const OUT_DIR = join(ROOT, "public", "images", "sports");
const KB = 1024;

const SPORTS = [
  "football",
  "cricket",
  "tennis",
  "padel",
  "multi-sport",
  "athletics",
  "badminton",
  "basketball",
  "pickleball",
];

// The sparkle watermark is painted over with `delogo` (it fills the box from the surrounding
// pixels, so a textured floor stays textured), then the same light grade as the other stills.
// Box position as a fraction of the picture, since the sources come in two widths.
const MARK = { x: 0.937, y: 0.885, w: 0.046, h: 0.073 };
const GRADE =
  "eq=contrast=1.06:saturation=0.85:brightness=-0.03,colorbalance=rh=0.04:bh=-0.04," +
  "scale=1600:-2:flags=lanczos";

function size(input) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", input],
    { encoding: "utf8" },
  );
  const [width, height] = result.stdout.trim().split("x").map(Number);
  return { width, height };
}

function filter(input) {
  const { width, height } = size(input);
  const x = Math.round(width * MARK.x);
  const y = Math.round(height * MARK.y);
  const w = Math.min(Math.round(width * MARK.w), width - x - 2);
  const h = Math.min(Math.round(height * MARK.h), height - y - 2);
  return `delogo=x=${x}:y=${y}:w=${w}:h=${h},${GRADE}`;
}

const BUDGET = 260 * KB;

function convert(id) {
  const input = join(SRC_DIR, `${id}.jpg`);
  if (!existsSync(input)) throw new Error(`missing source: ${input}`);
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      input,
      "-vf",
      filter(input),
      "-c:v",
      "libwebp",
      "-quality",
      "72",
      join(OUT_DIR, `${id}.webp`),
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${id}`);
}

function checkBudgets() {
  let ok = true;
  for (const id of SPORTS) {
    const out = join(OUT_DIR, `${id}.webp`);
    if (!existsSync(out)) {
      console.error(`✗ missing: ${out}`);
      ok = false;
      continue;
    }
    const size = statSync(out).size;
    const within = size <= BUDGET;
    console.log(
      `${within ? "✓" : "✗"} ${id}.webp — ${(size / KB).toFixed(0)} KB / ${BUDGET / KB} KB`,
    );
    if (!within) ok = false;
  }
  if (!ok) process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
if (!process.argv.includes("--check")) {
  for (const id of SPORTS) {
    console.log(`Converting ${id}…`);
    convert(id);
  }
}
checkBudgets();
