#!/usr/bin/env node
/**
 * SLORA video pipeline (Phase 0).
 *
 * Reads the two source clips from /video and writes web-ready derivatives to
 * /public/videos. Originals are never modified.
 *
 *   npm run assets:encode            encode everything, then check budgets
 *   npm run assets:encode -- --check only check budgets of existing files
 *   npm run assets:encode -- --only=how-we-build   re-encode a subset (name filter)
 *
 * Requires `ffmpeg` on PATH. Audio is stripped everywhere (autoplay is muted).
 * A light colour grade is baked in (slightly lower saturation, small contrast
 * lift, faintly warm highlights) so the footage sits in the black/gold brand
 * instead of relying on runtime CSS filters, which are costly on phones.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "videos");
const SRC = {
  hero: join(ROOT, "video", "hero_portion.mp4"),
  build: join(ROOT, "video", "video_2.mp4"),
};

const KB = 1024;
const MB = 1024 * KB;

const GRADE = "eq=contrast=1.06:saturation=0.85:brightness=-0.03,colorbalance=rh=0.04:bh=-0.04";
const H264 = [
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
];

/**
 * Seamless-loop filter graph for a 2.5 s clip: play 0.5→2.0 s, then cross-fade the tail
 * (2.0→2.5) into the head (0→0.5). The loop point then lands on identical footage.
 */
function seamlessLoop(width) {
  return [
    `[0:v]${GRADE},scale=${width}:-2,fps=24,split=3[a][b][c]`,
    "[a]trim=start=0.5:end=2.0,setpts=PTS-STARTPTS[mid]",
    "[b]trim=start=2.0:end=2.5,setpts=PTS-STARTPTS[tail]",
    "[c]trim=start=0:end=0.5,setpts=PTS-STARTPTS[head]",
    "[tail][head]xfade=transition=fade:duration=0.5:offset=0[x]",
    "[mid][x]concat=n=2:v=1:a=0,format=yuv420p[v]",
  ].join(";");
}

/** A single graded still (1280 wide) cut from `input` at the position given by `seek`. */
function still(out, input, seek, quality = 68) {
  return {
    out,
    budget: 130 * KB,
    args: [
      ...seek,
      "-i",
      input,
      "-frames:v",
      "1",
      "-vf",
      `${GRADE},scale=1280:-2`,
      "-c:v",
      "libwebp",
      "-quality",
      String(quality),
    ],
  };
}

/**
 * Every output: file name, input, ffmpeg args (before the output path), byte budget.
 * NOTE: scale comes BEFORE `reverse` so the reversed frame buffer stays small.
 */
const jobs = [
  // ── Hero: ambient loop = night floodlit wide shot (7.5 s – 10 s) ─────────────
  // Made SEAMLESS: the last 0.5 s cross-fades into the first 0.5 s, so when the browser
  // loops the file there is no visible jump. Result is 2.0 s long.
  {
    out: "slora-hero-loop-1080.mp4",
    budget: 2.5 * MB,
    args: [
      "-ss",
      "7.5",
      "-t",
      "2.5",
      "-i",
      SRC.hero,
      "-an",
      "-filter_complex",
      seamlessLoop(1920),
      "-map",
      "[v]",
      "-r",
      "24",
      "-crf",
      "23",
      ...H264,
    ],
  },
  {
    out: "slora-hero-loop-720.mp4",
    budget: 1.2 * MB,
    args: [
      "-ss",
      "7.5",
      "-t",
      "2.5",
      "-i",
      SRC.hero,
      "-an",
      "-filter_complex",
      seamlessLoop(1280),
      "-map",
      "[v]",
      "-r",
      "24",
      "-crf",
      "24",
      ...H264,
    ],
  },
  // Poster = first frame of the loop, so the poster → video hand-off is invisible.
  {
    out: "slora-hero-poster.webp",
    budget: 120 * KB,
    args: [
      "-ss",
      "7.5",
      "-i",
      SRC.hero,
      "-frames:v",
      "1",
      "-vf",
      `${GRADE},scale=1920:-2`,
      "-c:v",
      "libwebp",
      "-quality",
      "72",
    ],
  },
  {
    out: "slora-hero-poster-960.webp",
    budget: 60 * KB,
    args: [
      "-ss",
      "7.5",
      "-i",
      SRC.hero,
      "-frames:v",
      "1",
      "-vf",
      `${GRADE},scale=960:-2`,
      "-c:v",
      "libwebp",
      "-quality",
      "72",
    ],
  },
  // ── Stills cut from the hero footage (used by the first editorial card) ──────
  {
    out: "slora-football-still.webp",
    budget: 110 * KB,
    args: [
      "-ss",
      "2.2",
      "-i",
      SRC.hero,
      "-frames:v",
      "1",
      "-vf",
      `${GRADE},scale=1280:-2`,
      "-c:v",
      "libwebp",
      "-quality",
      "68",
    ],
  },
  // Macro fibres still (first shot of the hero footage): phone/reduced-motion stand-in for the 3D turf.
  {
    out: "slora-macro-still.webp",
    budget: 110 * KB,
    args: [
      "-ss",
      "0.6",
      "-i",
      SRC.hero,
      "-frames:v",
      "1",
      "-vf",
      `${GRADE},scale=1280:-2`,
      "-c:v",
      "libwebp",
      "-quality",
      "66",
    ],
  },
  // ── Stand-in stills for the other surface cards (cut from the same supplied footage) ──
  // The multi-line hall court stands in for pickleball and shuttle, the floodlit fenced court
  // for basketball, and the tree-lined ground at the end of the installation clip for the park
  // setup. All are ILLUSTRATIVE until SLORA supplies real photographs.
  still("slora-court-pickleball-still.webp", SRC.hero, ["-ss", "3.0"]),
  still("slora-court-shuttle-still.webp", SRC.hero, ["-ss", "4.33"]),
  still("slora-court-basketball-still.webp", SRC.hero, ["-ss", "9.0"]),
  still("slora-park-still.webp", SRC.build, ["-sseof", "-0.3"]),
  // Stand-ins for the Sports rail: the red running track close-up, and the dusk court with goals.
  still("slora-athletics-still.webp", SRC.hero, ["-ss", "5.3"]),
  still("slora-dusk-court-still.webp", SRC.hero, ["-ss", "6.6"]),
  // ── How We Build (video 2) ───────────────────────────────────────────────────
  {
    out: "how-we-build-1080.mp4",
    budget: 7 * MB,
    args: ["-i", SRC.build, "-an", "-vf", `${GRADE},scale=1920:-2`, "-crf", "24", ...H264],
  },
  {
    out: "how-we-build-scrub-540.mp4",
    budget: 5 * MB,
    args: [
      "-i",
      SRC.build,
      "-an",
      "-vf",
      `${GRADE},scale=960:-2`,
      "-crf",
      "29",
      "-g",
      "2",
      "-bf",
      "0",
      ...H264,
    ],
  },
  {
    out: "how-we-build-poster.webp",
    budget: 120 * KB,
    args: [
      "-ss",
      "0",
      "-i",
      SRC.build,
      "-frames:v",
      "1",
      "-vf",
      `${GRADE},scale=1600:-2`,
      "-c:v",
      "libwebp",
      "-quality",
      "50",
    ],
  },
];

/**
 * Scroll-driven footage as STILL FRAMES (12 per second), painted onto a canvas by the site.
 * A scrubbed <video> has to seek and decode on every scroll step and stalls ("buffering") on
 * computers that cannot decode fast; a still frame cannot stall. See lib/media/frameSequence.ts.
 * The hero footage is REVERSED (stadium → macro grass); the installation footage plays forwards.
 */
const SEQUENCES = [
  {
    id: "hero-descent",
    input: SRC.hero,
    vf: `${GRADE},scale=1440:-2,reverse,fps=12`,
    quality: 58,
    count: 120,
    budget: 8 * MB,
  },
  {
    id: "how-we-build",
    input: SRC.build,
    vf: `${GRADE},scale=1440:-2,fps=12`,
    quality: 50,
    count: 120,
    budget: 9 * MB,
  },
];

function encodeSequence(seq) {
  const dir = join(ROOT, "public", "sequences", seq.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const res = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-v",
      "error",
      "-i",
      seq.input,
      "-an",
      "-vf",
      seq.vf,
      "-c:v",
      "libwebp",
      "-quality",
      String(seq.quality),
      "-compression_level",
      "5",
      join(dir, "f%03d.webp"),
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  if (res.status !== 0) throw new Error(`ffmpeg failed for sequence ${seq.id}`);
}

function sequenceReport(list) {
  let failed = false;
  console.log(
    "\nframe sequence".padEnd(34) +
      "frames".padEnd(12) +
      "size".padEnd(12) +
      "budget".padEnd(12) +
      "result",
  );
  for (const seq of list) {
    const dir = join(ROOT, "public", "sequences", seq.id);
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".webp")) : [];
    const total = files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
    const ok = files.length === seq.count && total <= seq.budget;
    if (!ok) failed = true;
    console.log(
      seq.id.padEnd(33) +
        String(files.length).padEnd(12) +
        fmt(total).padEnd(12) +
        fmt(seq.budget).padEnd(12) +
        (ok ? "ok" : files.length !== seq.count ? `EXPECTED ${seq.count} FRAMES` : "OVER BUDGET"),
    );
  }
  return !failed;
}

const fmt = (bytes) =>
  bytes >= MB ? `${(bytes / MB).toFixed(2)} MB` : `${(bytes / KB).toFixed(0)} KB`;

function ffmpegExists() {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

function encode(job) {
  const target = join(OUT, job.out);
  const res = spawnSync("ffmpeg", ["-y", "-v", "error", ...job.args, target], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  if (res.status !== 0) throw new Error(`ffmpeg failed for ${job.out}`);
}

function report(list) {
  let failed = false;
  console.log("\nfile".padEnd(34) + "size".padEnd(12) + "budget".padEnd(12) + "result");
  for (const job of list) {
    const target = join(OUT, job.out);
    if (!existsSync(target)) {
      console.log(job.out.padEnd(33) + "MISSING".padEnd(12) + fmt(job.budget).padEnd(12) + "FAIL");
      failed = true;
      continue;
    }
    const size = statSync(target).size;
    const ok = size <= job.budget;
    if (!ok) failed = true;
    console.log(
      job.out.padEnd(33) +
        fmt(size).padEnd(12) +
        fmt(job.budget).padEnd(12) +
        (ok ? "ok" : "OVER BUDGET"),
    );
  }
  return !failed;
}

const checkOnly = process.argv.includes("--check");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;
const selected = only ? jobs.filter((j) => j.out.includes(only)) : jobs;
const selectedSequences = only
  ? SEQUENCES.filter((q) => q.id.includes(only) || only === "sequence")
  : SEQUENCES;

if (!checkOnly) {
  if (!ffmpegExists()) {
    console.error(
      "ffmpeg was not found on PATH. Install it (e.g. `winget install Gyan.FFmpeg`) and retry.",
    );
    process.exit(2);
  }
  for (const src of Object.values(SRC)) {
    if (!existsSync(src)) {
      console.error(`Source clip missing: ${src}`);
      process.exit(2);
    }
  }
  mkdirSync(OUT, { recursive: true });
  for (const seq of selectedSequences) {
    process.stdout.write(`encoding frames ${seq.id} … `);
    const t0 = Date.now();
    encodeSequence(seq);
    console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  for (const job of selected) {
    process.stdout.write(`encoding ${job.out} … `);
    const t0 = Date.now();
    encode(job);
    console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}

const videosOk = report(selected);
const sequencesOk = sequenceReport(selectedSequences);
process.exit(videosOk && sequencesOk ? 0 : 1);
