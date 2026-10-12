#!/usr/bin/env node
/**
 * The "services we provide" slides (2026-10-12): the client's AI-generated pictures
 * (`photo/photos_services/<id>.jpg`) → web stills (`public/images/services/<id>.webp`).
 * Originals are never modified. The generator's sparkle watermark (bottom right) is painted out
 * with ffmpeg's `delogo`, then the picture gets the site's light grade; the bright planning
 * drawing is also darkened so it sits on the black page instead of glaring.
 *
 *   npm run assets:encode:services            convert every picture listed below
 *   npm run assets:encode:services -- --check only check the files exist and fit budget
 *
 * Requires `ffmpeg` on PATH. The pictures show AI-invented text ("Line-Striper Pro 5000",
 * "Ultra-White Line Paint", …): check none is a real company's name before a public launch.
 * The fourth slide (usage planning) has no picture of its own yet and reuses an existing court
 * still (data/media.ts "dusk-court").
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "photo", "photos_services");
const OUT = join(ROOT, "public", "images", "services");
const KB = 1024;
const BUDGET = 300 * KB;

const GRADE = "eq=contrast=1.06:saturation=0.85:brightness=-0.03,colorbalance=rh=0.04:bh=-0.04";
const IMAGES = {
  planning: "eq=contrast=1.12:saturation=0.8:brightness=-0.42,colorbalance=rh=0.03:bh=-0.03",
  construction: GRADE,
  maintenance: GRADE,
};
const MARK = { x: 0.937, y: 0.885, w: 0.046, h: 0.073 };

function size(input) {
  const out = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", input],
    { encoding: "utf8" },
  );
  const [width, height] = out.stdout.trim().split("x").map(Number);
  return { width, height };
}

function convert(id, grade) {
  const input = join(SRC, `${id}.jpg`);
  if (!existsSync(input)) throw new Error(`missing source: ${input}`);
  const { width, height } = size(input);
  const x = Math.round(width * MARK.x);
  const y = Math.round(height * MARK.y);
  const w = Math.min(Math.round(width * MARK.w), width - x - 2);
  const h = Math.min(Math.round(height * MARK.h), height - y - 2);
  const vf = `delogo=x=${x}:y=${y}:w=${w}:h=${h},${grade},scale=1920:-2:flags=lanczos`;
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-i",
      input,
      "-vf",
      vf,
      "-c:v",
      "libwebp",
      "-quality",
      "74",
      join(OUT, `${id}.webp`),
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${id}`);
}

function check() {
  let ok = true;
  for (const id of Object.keys(IMAGES)) {
    const file = join(OUT, `${id}.webp`);
    if (!existsSync(file)) {
      console.error(`✗ missing: ${file}`);
      ok = false;
      continue;
    }
    const bytes = statSync(file).size;
    if (bytes > BUDGET) ok = false;
    console.log(
      `${bytes <= BUDGET ? "✓" : "✗"} ${id}.webp — ${(bytes / KB).toFixed(0)} KB / ${BUDGET / KB} KB`,
    );
  }
  if (!ok) process.exit(1);
}

mkdirSync(OUT, { recursive: true });
if (!process.argv.includes("--check")) {
  for (const [id, grade] of Object.entries(IMAGES)) {
    console.log(`Converting ${id}…`);
    convert(id, grade);
  }
}
check();
