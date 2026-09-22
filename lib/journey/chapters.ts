import { clamp01 } from "./phases";

interface TimedChapter {
  start: number;
  end: number;
}

/** Index of the chapter playing at time t (seconds). Before the first → 0, after the last → last. */
export function chapterIndexAt(chapters: readonly TimedChapter[], t: number): number {
  let index = 0;
  chapters.forEach((chapter, i) => {
    if (t >= chapter.start) index = i;
  });
  return index;
}

/** How far through its own chapter time t is (0 → 1). */
export function chapterProgress(chapters: readonly TimedChapter[], t: number): number {
  const chapter = chapters[chapterIndexAt(chapters, t)];
  return clamp01((t - chapter.start) / (chapter.end - chapter.start));
}
