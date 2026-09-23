import { expect, test } from "@playwright/test";

/** The opening sequence is finished when <html data-stage="ready">. */
const waitForReady = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() => document.documentElement.dataset.stage === "ready", null, {
    timeout: 45_000,
  });

test.describe("home: entrance → header → hero", () => {
  test("the opening sequence runs, then the hero headline, menu and video are in place", async ({
    page,
  }) => {
    const problems: string[] = [];
    // (three.js's own "THREE.Clock is deprecated" notice comes from inside react-three-fiber)
    page.on(
      "console",
      (m) =>
        ["error", "warning"].includes(m.type()) &&
        !/THREE\.Clock/.test(m.text()) &&
        problems.push(m.text()),
    );
    page.on("pageerror", (e) => problems.push(e.message));

    // "commit" = as soon as the page starts arriving, so we see the curtain before it lifts
    await page.goto("/", { waitUntil: "commit" });

    // while it plays there is a black curtain and a way to skip
    await expect(page.locator("[data-entrance]")).toBeVisible();
    await expect(page.getByRole("button", { name: /skip/i })).toBeVisible();

    await waitForReady(page);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/we build/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/you move on/i);

    // the logo ended up docked in the header, top-left
    const brand = await page.locator("[data-brand]").boundingBox();
    expect(brand).not.toBeNull();
    expect(brand!.x).toBeLessThan(200);
    expect(brand!.y).toBeLessThan(120);

    // the hero video is wired up with both file sizes (Playwright's Chromium cannot decode
    // H.264, so we check the element rather than playback). Scoped to the hero itself: the
    // football surface card further down the page also autoplays a real looping video
    // (master prompt "Connect with us" work), so `video[loop]` alone is no longer unique
    // on the page.
    const video = page.locator("[data-hero-media] video[loop]");
    await expect(video).toHaveCount(1);
    expect(await video.locator("source").count()).toBe(2);
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop)).toBe(true);

    // the curtain is gone and nothing complained
    await expect(page.locator("[data-entrance]")).toBeHidden();
    expect(problems).toEqual([]);
  });

  test("the numbered menu links go to real sections", async ({ page, isMobile }) => {
    await page.goto("/");
    await waitForReady(page);
    if (isMobile) {
      await page.getByRole("button", { name: "MENU" }).click();
      const menu = page.getByRole("dialog", { name: "Menu" });
      await expect(menu.getByRole("link")).toHaveCount(6); // the six sections…
      await expect(menu.getByRole("button", { name: /BUILD WITH SLORA/ })).toBeVisible(); // …and the chat button
      await menu.getByRole("link", { name: /sports/i }).click();
      await expect(menu).toBeHidden();
    } else {
      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav.getByRole("link")).toHaveCount(6);
      await nav.getByRole("link", { name: /sports/i }).click();
    }
    // Lenis animates the jump, so wait for the section to reach the top of the screen
    await expect
      .poll(
        async () =>
          page.evaluate(() => document.getElementById("sports")!.getBoundingClientRect().top),
        {
          timeout: 8000,
        },
      )
      .toBeLessThan(200);
  });

  test("the round scroll button sits over the footage and the page does not overflow", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("link", { name: "Scroll down" })).toBeVisible();
  });
});

test.describe("home: the scroll journey", () => {
  test("the hero pins into a tall journey that ends on the 3D cross-section", async ({ page }) => {
    // ?journey=full forces the 3D tier: test machines draw WebGL in software, which the site
    // would (rightly) treat as "no graphics card" and skip the 3D. On a phone screen too,
    // since 2026-09-23 — the device's own graphics card decides this, never screen width.
    await page.goto("/?journey=full");
    await waitForReady(page);

    const size = await page.evaluate(() => ({
      wrap: document.getElementById("top")!.getBoundingClientRect().height,
      vh: window.innerHeight,
    }));
    expect(size.wrap).toBeGreaterThan(size.vh * 8);

    // the 3D scene is downloaded once the page is ready, never at load
    await expect(page.locator("canvas:not([data-frames])")).toHaveCount(1, { timeout: 20_000 });

    // scroll to the end of the journey: all five layer labels appear, one after another
    await page.evaluate(() =>
      window.scrollTo(0, document.getElementById("top")!.offsetHeight - window.innerHeight),
    );
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const names = ["GRASS FIBRES", "INFILL", "BACKING", "BASE", "DRAINAGE"];
            return names.map((name) => {
              const span = [...document.querySelectorAll("span")].find((s) =>
                s.textContent?.includes(name),
              );
              return Number(span?.closest("div")?.style.opacity ?? 0);
            });
          }),
        { timeout: 30_000 },
      )
      .toEqual([1, 1, 1, 1, 1]);

    await expect(page.getByText("ILLUSTRATIVE · NOT TO SCALE")).toBeVisible();
    // the menu knows we are still in "Surfaces"
    await expect(page.locator("nav a[aria-current='true']")).toContainText(/surfaces/i);
  });

  test("a computer WITHOUT a graphics card gets the smooth video-only journey, no 3D, then a drawn version of the layers", async ({
    page,
  }) => {
    // (test machines draw WebGL in software, so this is also what visitors on such machines get
    // — on phones too, since 2026-09-23 the journey is decided by the device's own graphics
    // card, never by screen width: see "the 3D tier" tests further down)
    await page.goto("/?journey=video");
    await waitForReady(page);

    const size = await page.evaluate(() => ({
      wrap: document.getElementById("top")!.getBoundingClientRect().height,
      vh: window.innerHeight,
    }));
    expect(size.wrap).toBeGreaterThan(size.vh * 5); // still a pinned, scroll-driven descent…
    expect(size.wrap).toBeLessThan(size.vh * 6.5); // …but a shorter one, with no 3D part
    await expect(page.locator("canvas:not([data-frames])")).toHaveCount(0);

    // the menu's "Surfaces" anchor lives inside the journey, and the drawn layers follow it
    expect(await page.locator("#top #surfaces").count()).toBe(1);
    await expect(page.locator("#surface-layers li")).toHaveCount(5);
    await expect(page.locator("#surface-layers li").first()).toContainText("GRASS FIBRES");

    // scrolling to the end of the pinned part shows the gauge's last stop and no dark gap
    await page.evaluate(() =>
      window.scrollTo(0, document.getElementById("top")!.offsetHeight - window.innerHeight),
    );
    await expect(page.locator("nav a[aria-current='true']")).toContainText(/surfaces/i);
  });

  test("the descent is painted from still frames on a canvas (no video to seek), and the picture changes as you scroll", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/?journey=video");
    await waitForReady(page);

    // The only <video> in the journey itself is the looping hero: the descent no longer
    // seeks a video (the football surface card further down the page has its own separate
    // looping video — "Connect with us" work — so this is scoped to `#top`, not the page).
    await expect(page.locator("#top video")).toHaveCount(1);
    // How We Build keeps its own, separate desktop-only pinned mode (untouched by the journey
    // now reaching phones), so a phone gets only the journey's own frame-sequence canvas.
    await expect(page.locator("canvas[data-frames]")).toHaveCount(isMobile ? 1 : 2);

    /** A 16 × 9 thumbnail of what the descent canvas is showing, as plain numbers. */
    const thumbnail = () =>
      page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>("#top canvas[data-frames]")!;
        const small = document.createElement("canvas");
        small.width = 16;
        small.height = 9;
        const ctx = small.getContext("2d")!;
        ctx.drawImage(canvas, 0, 0, 16, 9);
        const rgba = ctx.getImageData(0, 0, 16, 9).data;
        return {
          opacity: Number(getComputedStyle(canvas).opacity),
          pixels: Array.from(rgba).filter((_, i) => i % 4 !== 3),
        };
      });
    const scrollJourneyTo = (p: number) =>
      page.evaluate(
        (fraction) =>
          window.scrollTo(
            0,
            (document.getElementById("top")!.offsetHeight - window.innerHeight) * fraction,
          ),
        p,
      );

    await scrollJourneyTo(0.3);
    await expect
      .poll(
        async () => {
          const { opacity, pixels } = await thumbnail();
          return opacity > 0.99 && Math.max(...pixels) > 40;
        },
        { timeout: 30_000 },
      )
      .toBe(true);
    const early = await thumbnail();

    await scrollJourneyTo(0.95);
    await expect
      .poll(
        async () => {
          const { pixels } = await thumbnail();
          // a different picture: the two thumbnails differ noticeably
          const difference = pixels.reduce((sum, v, i) => sum + Math.abs(v - early.pixels[i]), 0);
          return difference / pixels.length;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThan(8);
  });

  test("HOW WE BUILD is painted from still frames too, and follows the scroll", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the pinned section is desktop only");
    await page.goto("/?journey=video");
    await waitForReady(page);
    const thumbnail = () =>
      page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>("#process canvas[data-frames]")!;
        const small = document.createElement("canvas");
        small.width = 16;
        small.height = 9;
        const ctx = small.getContext("2d")!;
        ctx.drawImage(canvas, 0, 0, 16, 9);
        return {
          opacity: Number(getComputedStyle(canvas).opacity),
          pixels: Array.from(ctx.getImageData(0, 0, 16, 9).data).filter((_, i) => i % 4 !== 3),
        };
      });
    const scrollProcessTo = (p: number) =>
      page.evaluate((fraction) => {
        const section = document.getElementById("process")!;
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + (section.offsetHeight - window.innerHeight) * fraction);
      }, p);

    await scrollProcessTo(0.1);
    await expect
      .poll(
        async () => {
          const { opacity, pixels } = await thumbnail();
          return opacity > 0.99 && Math.max(...pixels) > 40;
        },
        { timeout: 30_000 },
      )
      .toBe(true);
    const early = await thumbnail();

    await scrollProcessTo(0.9);
    await expect
      .poll(
        async () => {
          const { pixels } = await thumbnail();
          const difference = pixels.reduce((sum, v, i) => sum + Math.abs(v - early.pixels[i]), 0);
          return difference / pixels.length;
        },
        { timeout: 30_000 },
      )
      .toBeGreaterThan(6);
  });

  test("scrolling straight away (while the headline is still animating in) still clears the tagline and headline", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the pinned descent is desktop only");
    await page.goto("/?journey=video");
    await waitForReady(page);
    // scroll at once: the entrance animation of the small text is still running
    await page.evaluate(() =>
      window.scrollTo(0, (document.getElementById("top")!.offsetHeight - innerHeight) * 0.3),
    );
    await expect
      .poll(
        async () =>
          page.evaluate(() => ({
            tagline: Number(getComputedStyle(document.querySelector("[data-tagline]")!).opacity),
            headline: Number(getComputedStyle(document.querySelector("[data-headline]")!).opacity),
          })),
        { timeout: 15_000 },
      )
      .toEqual({ tagline: 0, headline: 0 });
    // and they stay cleared after the entrance animation has certainly finished
    await page.waitForTimeout(3500);
    expect(
      await page.evaluate(() =>
        Number(getComputedStyle(document.querySelector("[data-tagline]")!).opacity),
      ),
    ).toBe(0);
  });

  test("the 3D tier is offered on a phone too, when the device's own graphics card can take it (client request 2026-09-23: match the laptop)", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "the 'full' tier is exercised on desktop by other tests");
    // `?journey=full` asks for the 3D tier regardless of the test machine's real hardware (it
    // is meant for exactly this: reviewing a tier the machine wouldn't otherwise get) — the
    // point of this test is that a NARROW screen no longer rules it out by itself.
    await page.goto("/?journey=full");
    await waitForReady(page);
    await expect(page.locator("canvas:not([data-frames])")).toHaveCount(1);
  });

  test("without a graphics card, a phone gets the same video-only journey as a desktop without one — not the light version", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "the video tier is exercised on desktop by the test above");
    // No override: on this software-rendered test browser that means "video" tier, the same
    // as a desktop without a graphics card gets (previous tests) — screen width no longer
    // downgrades it further to the light version.
    await page.goto("/");
    await waitForReady(page);
    await expect(page.locator("canvas:not([data-frames])")).toHaveCount(0); // no 3D
    await expect(page.locator("canvas[data-frames]")).toHaveCount(1); // but a real descent
    // (the video tier's drawn layers, a section of its own right after the journey — not the
    // menu's #surfaces anchor, which sits inside the journey regardless of which tier it is)
    expect(await page.locator("#surface-layers").count()).toBe(1);
    const size = await page.evaluate(() => ({
      wrap: document.getElementById("top")!.getBoundingClientRect().height,
      vh: window.innerHeight,
    }));
    expect(size.wrap).toBeGreaterThan(size.vh * 5); // a real pinned, scroll-driven descent…
    expect(size.wrap).toBeLessThan(size.vh * 6.5); // …the shorter, no-3D length
  });

  test("?journey=light still gives the plain, non-pinned version, on any device", async ({
    page,
  }) => {
    await page.goto("/?journey=light");
    await waitForReady(page);
    await expect(page.locator("canvas:not([data-frames])")).toHaveCount(0);
    const layers = page.locator("#surfaces li");
    await expect(layers).toHaveCount(5);
    await expect(layers.first()).toContainText("GRASS FIBRES");
    await expect(page.getByText("ILLUSTRATIVE · NOT TO SCALE")).toBeAttached();
    // and the page is only as tall as its content (no giant pinned section)
    const ratio = await page.evaluate(
      () => document.getElementById("top")!.getBoundingClientRect().height / window.innerHeight,
    );
    expect(ratio).toBeLessThan(1.5);
  });
});

test.describe("chat window", () => {
  // The frosted-glass chat is very slow to draw when graphics are done in software (as in these
  // test browsers), so these tests get a longer time limit and wait longer for each message.
  test.slow();
  const slowly = expect.configure({ timeout: 30_000 });

  test("opens from the floating button, asks the six questions, checks each answer, and is honest that it is a preview", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    await page.getByRole("button", { name: "Open the SLORA enquiry chat" }).click();

    const chat = page.getByRole("dialog", { name: "SLORA enquiry chat" });
    await slowly(chat).toBeVisible();
    await slowly(chat.getByText("Hi. Let's build something with SLORA.")).toBeVisible();
    const box = chat.getByRole("textbox");
    const answer = async (text: string, next: RegExp | string) => {
      await box.fill(text);
      await box.press("Enter");
      await slowly(chat.getByText(next).last()).toBeVisible();
    };

    await slowly(chat.getByText("What is your name?")).toBeVisible();
    await answer("Asha Raman", "Which city is your project in?");
    await answer("Chennai", "What are you looking to build?");
    await chat.getByRole("button", { name: "Football Turf" }).click();
    await slowly(chat.getByText(/site or project link/i)).toBeVisible();
    await chat.getByRole("button", { name: "Skip" }).click();
    await slowly(chat.getByText("Approximate project area?")).toBeVisible();

    // bad answers are refused with a friendly message; the question stays
    await answer("lots", /Enter the area as a number/i);
    await answer("10,000 sq ft", "What is your contact number?");
    await answer("12345", /valid phone number/i);
    await answer("98765 43210", "THANK YOU.");

    // the summary shows the tidied-up details, and does NOT pretend anything was sent
    await slowly(chat.locator("dd", { hasText: "+919876543210" })).toBeVisible();
    await slowly(chat.locator("dd", { hasText: "10,000 sq ft" })).toBeVisible();
    await slowly(chat.getByText(/PREVIEW ONLY/)).toBeVisible();
    await slowly(chat.getByText(/have been received/i)).toHaveCount(0);

    // Escape closes it
    await page.keyboard.press("Escape");
    await slowly(chat).toBeHidden();
  });

  test("the header's BUILD WITH SLORA button opens it too", async ({ page, isMobile }) => {
    test.skip(isMobile, "on phones this button lives inside the menu");
    await page.goto("/");
    await waitForReady(page);
    await page
      .getByRole("button", { name: /BUILD WITH SLORA/ })
      .first()
      .click();
    await slowly(page.getByRole("dialog", { name: "SLORA enquiry chat" })).toBeVisible();
  });
});

test.describe("home: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("skips the intro, shows the poster instead of a moving video, keeps everything usable", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    await expect(page.locator("[data-entrance]")).toBeHidden();
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("canvas:not([data-frames])")).toHaveCount(0);
    await expect(page.locator("#surfaces li")).toHaveCount(5);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("[data-brand]")).toBeVisible();
  });
});

test("the type specimen renders every section, loads its fonts and has no errors", async ({
  page,
}) => {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
  page.on("pageerror", (e) => problems.push(e.message));

  await page.goto("/specimen");

  for (const name of [
    /hero composition/i,
    /display face/i,
    /heavy .* thin/i,
    /technical labels/i,
    /^colour$/i,
    /editorial card/i,
  ]) {
    await expect(page.getByRole("heading", { name })).toHaveCount(1);
  }

  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => f.status === "loaded")
      .map((f) => f.family.replace(/["']/g, "")),
  );
  for (const family of ["Unbounded Variable", "Shrikhand", "Bagel Fat One"]) {
    expect(loaded, `${family} should be loaded`).toContain(family);
  }

  // Nothing may push the page wider than the screen (matters most on the mobile project).
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  expect(problems).toEqual([]);
});

test("the specimen is kept out of search engines", async ({ page }) => {
  await page.goto("/specimen");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("the leads endpoint is write-only and rejects bad input", async ({ request }) => {
  expect((await request.get("/api/leads")).status()).toBe(405);
  const bad = await request.post("/api/leads", { data: { name: "x", phoneNumber: "12345" } });
  expect(bad.status()).toBe(400);
  expect((await bad.json()).error).toBe("invalid");
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});
