import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { stills, videos, type MediaSource } from "@/data/media";

const onDisk = (publicPath: string) => join(process.cwd(), "public", publicPath);

const referenced = new Set<string>();
for (const video of Object.values(videos)) {
  referenced.add(video.poster);
  for (const source of video.sources) referenced.add(source.src);
}
for (const still of Object.values(stills)) referenced.add(still.src);

describe("media manifest", () => {
  it.each([...referenced])("%s exists in /public and is not empty", (publicPath) => {
    expect(
      existsSync(onDisk(publicPath)),
      `${publicPath} is missing — run npm run assets:encode`,
    ).toBe(true);
    expect(statSync(onDisk(publicPath)).size).toBeGreaterThan(1000);
  });

  it.each(Object.entries(videos))(
    "%s: media-query sources come first, a default source comes last",
    (_id, video) => {
      const sources: readonly MediaSource[] = video.sources;
      expect(sources[sources.length - 1].media).toBeUndefined();
      expect(sources.findIndex((s) => !s.media)).toBe(sources.length - 1);
    },
  );

  it("every video is 16:9 with a positive duration", () => {
    for (const video of Object.values(videos)) {
      expect(video.width / video.height).toBeCloseTo(16 / 9, 2);
      expect(video.durationSeconds).toBeGreaterThan(0);
    }
  });
});
