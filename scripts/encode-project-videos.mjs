#!/usr/bin/env node
/**
 * SLORA project footage (2026-10-12).
 *
 * Turns the client's raw project clips (`video/projects/<folder>/*`, up to 4K, hundreds of MB)
 * into small web clips + posters under `public/videos/projects/<project>/`. Originals are never
 * modified. Only the clips listed below are used (the folders hold ~50); each is trimmed, scaled
 * to about 720p, given the site's light colour grade and stripped of audio (autoplay is muted).
 *
 *   npm run assets:encode:projects            encode every listed clip
 *   npm run assets:encode:projects -- --check only check the output files exist and fit budget
 *   npm run assets:encode:projects -- --only=tbm   re-encode one project (name filter)
 *
 * Requires `ffmpeg` on PATH. Phone clips carry a rotation flag that ffmpeg applies by itself;
 * the Sony `C05xx` clips have none and were filmed sideways, so they get `transpose=2`.
 *
 * Clip choice (which of the ~50 were kept, and why) is recorded next to each project below;
 * `data/projects.ts` must list exactly these ids — `tests/unit/projects.test.ts` checks it.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "video", "projects");
const OUT = join(ROOT, "public", "videos", "projects");
const KB = 1024;
const MB = 1024 * KB;

const GRADE = "eq=contrast=1.06:saturation=0.85:brightness=-0.03,colorbalance=rh=0.04:bh=-0.04";
/** Long side 1280 px for either orientation. */
const SCALE = "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)':flags=lanczos";

/**
 * `ss` = start second, `t` = length. The first clip of each project is its card picture and
 * its opening clip. `fix` is an extra filter for sources filmed sideways.
 */
export const PROJECTS = {
  "vellore-turf": {
    // one 55 s 4K drone flight over a football pitch (853 MB): three slices of it
    folder: "vellor_turff",
    clips: [
      { file: "dji_fly_20260823_100824_248_1787664415069_video.mp4", ss: 0, t: 8 },
      { file: "dji_fly_20260823_100824_248_1787664415069_video.mp4", ss: 22, t: 7 },
      { file: "dji_fly_20260823_100824_248_1787664415069_video.mp4", ss: 44, t: 8 },
    ],
  },
  flooring: {
    // three rooftop drone clips; DJI_0094 is under half a second, so it is left out
    folder: "flooring",
    clips: [
      { file: "DJI_0085.MP4", ss: 0, t: 6 },
      { file: "DJI_0096.MP4", ss: 0, t: 8 },
      { file: "DJI_0070.MP4", ss: 0, t: 6 },
    ],
  },
  pickleball: {
    // the five Sony clips, filmed sideways; people are visible in them (see the plan notes)
    folder: "pikeleball",
    clips: [
      { file: "C0580.MP4", ss: 0, t: 8, fix: "transpose=2" },
      { file: "C0566.MP4", ss: 0, t: 7, fix: "transpose=2" },
      { file: "C0567.MP4", ss: 0, t: 7, fix: "transpose=2" },
      { file: "C0582.MP4", ss: 0, t: 8, fix: "transpose=2" },
    ],
  },
  "tbm-pickleball": {
    // 30 clips: the finished court first, then the colour-coating work, then close-ups
    folder: "tbm_pickleball",
    clips: [
      { file: "IMG_3269.MOV", ss: 0, t: 9 },
      { file: "IMG_3187.MOV", ss: 0, t: 8 },
      { file: "IMG_3174.MOV", ss: 0, t: 6 },
      { file: "IMG_3199.MOV", ss: 0, t: 7 },
      { file: "IMG_3210.MOV", ss: 0, t: 7 },
      { file: "IMG_3228.MOV", ss: 0, t: 6 },
      { file: "IMG_3263.MOV", ss: 0, t: 6 },
    ],
  },
  "site-preparation": {
    // 11 short phone clips of ground levelling and stone-base work; six kept
    folder: "bts",
    clips: [
      { file: "IMG_0409.MOV", ss: 0, t: 6 },
      { file: "IMG_0146.MOV", ss: 0, t: 5 },
      { file: "IMG_0267.MOV", ss: 0, t: 6 },
      { file: "IMG_0410.MP4", ss: 0, t: 2 },
      { file: "IMG_0205.MOV", ss: 0, t: 3.5 },
      { file: "IMG_0408.MOV", ss: 0, t: 8 },
    ],
  },
};

const CLIP_BUDGET = 4 * MB;
const POSTER_BUDGET = 200 * KB;
const pad = (i) => String(i + 1).padStart(2, "0");

function run(args) {
  const result = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

function encode(id, project) {
  const dir = join(OUT, id);
  mkdirSync(dir, { recursive: true });
  project.clips.forEach((clip, i) => {
    const input = join(SRC, project.folder, clip.file);
    if (!existsSync(input)) throw new Error(`missing source: ${input}`);
    const vf = [clip.fix, SCALE, GRADE].filter(Boolean).join(",");
    const base = join(dir, pad(i));
    console.log(`  ${id} ${pad(i)} ← ${clip.file}`);
    run([
      "-ss",
      String(clip.ss),
      "-t",
      String(clip.t),
      "-i",
      input,
      "-an",
      "-vf",
      vf,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "27",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      `${base}.mp4`,
    ]);
    // the poster is a frame a second in, so it is never a black or blurry first frame
    run([
      "-ss",
      String(Math.min(1, clip.t / 2)),
      "-i",
      `${base}.mp4`,
      "-frames:v",
      "1",
      "-c:v",
      "libwebp",
      "-quality",
      "70",
      `${base}.webp`,
    ]);
  });
}

function check() {
  let ok = true;
  for (const [id, project] of Object.entries(PROJECTS)) {
    project.clips.forEach((_, i) => {
      for (const [ext, budget] of [
        ["mp4", CLIP_BUDGET],
        ["webp", POSTER_BUDGET],
      ]) {
        const file = join(OUT, id, `${pad(i)}.${ext}`);
        if (!existsSync(file)) {
          console.error(`✗ missing: ${file}`);
          ok = false;
          continue;
        }
        const size = statSync(file).size;
        const within = size <= budget;
        if (!within) ok = false;
        console.log(
          `${within ? "✓" : "✗"} ${id}/${pad(i)}.${ext} — ${(size / KB).toFixed(0)} KB / ${budget / KB} KB`,
        );
      }
    });
  }
  if (!ok) process.exit(1);
}

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
if (!process.argv.includes("--check")) {
  for (const [id, project] of Object.entries(PROJECTS)) {
    if (only && !id.includes(only)) continue;
    console.log(`Encoding ${id}…`);
    encode(id, project);
  }
}
check();
