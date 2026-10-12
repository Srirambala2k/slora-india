#!/usr/bin/env node
/**
 * SLORA surface reference photos (CR-1, 2026-09-25).
 *
 * Converts the client's reference photos (`photo/photos_surface/<surface>/*.jpg`) into
 * web-ready stills (`public/images/surfaces/<id>.webp`), the same way `encode-video.mjs`
 * turns the supplied videos into web-ready derivatives. Originals are never modified.
 *
 *   npm run assets:encode:surfaces            convert every surface listed below
 *   npm run assets:encode:surfaces -- --check only check the output files exist and fit budget
 *
 * Requires `ffmpeg` on PATH (already required by assets:encode).
 *
 * ── Which file was picked from each folder, and why (read this before adding more) ──
 * The client supplied 2 photos per surface. Only ONE is used per surface (the other is
 * left in place, untouched, in case it is useful later); several are not used at all:
 *
 *   acrylic-court/  → "…Houston.jpg" (a real outdoor acrylic-surfaced multi-court, mid
 *                     build). NOT "download.jpg": that one is actually an INDOOR court —
 *                     mislabelled for this folder.
 *   rubber-trac/    → "download.jpg" (clean, empty running track). NOT "download (1).jpg":
 *                     it carries a visible Shutterstock watermark — never ship a watermarked
 *                     stock photo, licensed or not, per the project's own photo rules.
 *   vinyl-court/    → the "…Guardwe.jpg" indoor badminton hall. "Badminton Court
 *                     Flooing.jpg" is also usable (indoor multi-court hall) but unused for
 *                     now, to avoid two very similar shots.
 *   wood-court/     → "Northern BC…jpg" (a real gym floor mid-resurfacing). NOT "Readers
 *                     Share…jpg": that file is a ~12 KB thumbnail, far too low-resolution.
 *   synthetic-cour/ → NEITHER photo is usable. One is a manufacturer's exploded-layer
 *                     diagram with "PU-Sport" branding baked into the pixels; the other is
 *                     a marketing composite (a court photo with a product-swatch graphic
 *                     glued on top). Do not convert either — see IMPLEMENTATION_PLAN.md
 *                     CR-1 for the still-illustrative fallback used instead.
 *   resurfacing/    → NEITHER photo is usable. One is a specific company's own tile-swatch
 *                     marketing render; the other is an unrelated business's ad for LAWN
 *                     (turf) cleaning, not a sports surface at all. Same fallback as above.
 *
 * ── An honest limitation, not hidden in a manifest comment ──
 * Every source photo is only 736 px wide (a Pinterest/search-result download size), so
 * these are upscaled here to the site's usual 1280 px still width — expect them to read as
 * a little soft, especially on a large screen. They also almost certainly come from the
 * companies whose names are in the original filenames (Guardwe, "Build My Courts", a
 * "Northern BC" flooring contractor) — i.e. someone else's own marketing photography, not
 * licensed stock. Treat these exactly like the AI stand-in footage already on the site:
 * fine for development and client review, not for a public launch, until SLORA either
 * clears the rights or (better) supplies its own project photos.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "photo", "photos_surface");
const OUT_DIR = join(ROOT, "public", "images", "surfaces");
const KB = 1024;

// Same light grade as encode-video.mjs, so these sit in the brand's look rather than
// arriving with whatever colour cast the original screenshot/download happened to have.
const GRADE = "eq=contrast=1.06:saturation=0.85:brightness=-0.03,colorbalance=rh=0.04:bh=-0.04";

const PHOTOS = [
  {
    id: "acrylic-court",
    in: join(
      SRC_DIR,
      "acrylic-court",
      "Tennis Court Construction by Build My Courts in Morgon’s Point, Houston.jpg",
    ),
  },
  {
    id: "rubber-track",
    in: join(SRC_DIR, "rubber-trac", "download.jpg"),
  },
  {
    id: "vinyl-court",
    in: join(
      SRC_DIR,
      "vinyl-court",
      "Sports Flooring, PVC Indoor Sports Flooring Manufacturers and Suppliers _ Guardwe.jpg",
    ),
  },
  {
    id: "wood-court",
    in: join(
      SRC_DIR,
      "wood-court",
      "Northern BC, Basketball Gymnasium Floor resurfacing and repair.jpg",
    ),
  },
];

const BUDGET = 200 * KB; // real photos (grass, gym floors, crowd stands…) compress less than the video stills' simpler frames

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${cmd} failed (exit ${result.status})`);
}

function convert(photo) {
  if (!existsSync(photo.in)) throw new Error(`missing source: ${photo.in}`);
  const out = join(OUT_DIR, `${photo.id}.webp`);
  run("ffmpeg", [
    "-y",
    "-i",
    photo.in,
    "-vf",
    `${GRADE},scale=1280:-2:flags=lanczos`,
    "-c:v",
    "libwebp",
    "-quality",
    "68",
    out,
  ]);
  return out;
}

function checkBudgets() {
  let ok = true;
  for (const photo of PHOTOS) {
    const out = join(OUT_DIR, `${photo.id}.webp`);
    if (!existsSync(out)) {
      console.error(`✗ missing: ${out}`);
      ok = false;
      continue;
    }
    const size = statSync(out).size;
    const within = size <= BUDGET;
    console.log(
      `${within ? "✓" : "✗"} ${photo.id}.webp — ${(size / KB).toFixed(0)} KB / ${BUDGET / KB} KB`,
    );
    if (!within) ok = false;
  }
  if (!ok) process.exit(1);
}

const checkOnly = process.argv.includes("--check");
mkdirSync(OUT_DIR, { recursive: true });
if (!checkOnly) {
  for (const photo of PHOTOS) {
    console.log(`Converting ${photo.id}…`);
    convert(photo);
  }
}
checkBudgets();
console.log(
  checkOnly ? "All surface stills within budget." : "Surface stills converted and within budget.",
);
