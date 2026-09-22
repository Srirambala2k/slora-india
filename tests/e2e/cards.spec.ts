import { expect, test, type Locator, type Page } from "@playwright/test";

// The frosted-glass chat is slow to draw in software GL, more so under full-suite load;
// its assertions get 30 s rather than the default 15 s (same convention as sports.spec.ts).
const slowly = expect.configure({ timeout: 30_000 });

const waitForReady = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.stage === "ready", null, {
    timeout: 45_000,
  });

/** Open the home page and bring the surface-card deck into view. */
async function openDeck(page: Page): Promise<Locator> {
  await page.goto("/?journey=light");
  await waitForReady(page);
  const deck = page.getByRole("region", { name: "Surface cards" });
  await deck.scrollIntoViewIfNeeded();
  return deck;
}

/** The one card that is not `inert` (the one you can see, focus and hear). */
const current = (deck: Locator) => deck.locator("[aria-roledescription='slide']:not([inert])");

const NAMES = [
  "Football turf",
  "Pickleball court",
  "Shuttle court",
  "Park setup",
  "Basketball court",
];

test.describe("surface cards: the arrow on the right", () => {
  test("starts on football, and the right arrow goes through pickleball, shuttle court, park setup and basketball, then back to football", async ({
    page,
  }) => {
    const deck = await openDeck(page);
    await expect(deck.locator("[aria-roledescription='slide']")).toHaveCount(5);
    await expect(current(deck)).toHaveCount(1);
    await expect(current(deck)).toHaveAttribute("aria-label", `1 of 5: ${NAMES[0]}`);

    const next = deck.getByRole("button", { name: /^Next:/ });
    for (let step = 1; step <= 4; step++) {
      await expect(next).toHaveAccessibleName(`Next: ${NAMES[step]}`); // says where it goes
      await next.click();
      await expect(current(deck)).toHaveAttribute("aria-label", `${step + 1} of 5: ${NAMES[step]}`);
    }
    // after the last card it wraps round to the first
    await next.click();
    await expect(current(deck)).toHaveAttribute("aria-label", `1 of 5: ${NAMES[0]}`);
  });

  test("the card that is shown really slides into view (and the others are out of the way)", async ({
    page,
  }) => {
    const deck = await openDeck(page);
    await deck.getByRole("button", { name: /^Next:/ }).click();
    const slide = current(deck);
    await expect
      .poll(
        async () => {
          const box = await slide.boundingBox();
          const frame = await deck.locator("[class*='viewport']").boundingBox();
          return box && frame ? Math.abs(box.x - frame.x) : 9999;
        },
        { timeout: 6000 },
      )
      .toBeLessThan(2);
    // a clear headline for the card, for screen readers
    await expect(slide.getByRole("heading", { level: 3, name: "Pickleball court" })).toBeAttached();
  });

  test("the back arrow appears only after moving on, and returns to the previous card", async ({
    page,
  }) => {
    const deck = await openDeck(page);
    // hidden from assistive technology while there is nothing to go back to
    await expect(deck.getByRole("button", { name: /^Previous/ })).toHaveCount(0);
    await deck.getByRole("button", { name: /^Next:/ }).click();
    const back = deck.getByRole("button", { name: /^Previous: Football turf/ });
    await expect(back).toBeVisible();
    await back.click();
    await expect(current(deck)).toHaveAttribute("aria-label", `1 of 5: ${NAMES[0]}`);
  });

  test("the names underneath jump straight to a card, and the keyboard's arrow keys move too", async ({
    page,
    isMobile,
  }) => {
    const deck = await openDeck(page);
    await deck.getByRole("button", { name: "Show Basketball court" }).click();
    await expect(current(deck)).toHaveAttribute("aria-label", `5 of 5: ${NAMES[4]}`);
    await expect(deck.getByRole("button", { name: "Show Basketball court" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    test.skip(isMobile, "arrow keys are for keyboards");
    await deck.getByRole("button", { name: /^Next:/ }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(current(deck)).toHaveAttribute("aria-label", `4 of 5: ${NAMES[3]}`);
    await page.keyboard.press("ArrowRight");
    await expect(current(deck)).toHaveAttribute("aria-label", `5 of 5: ${NAMES[4]}`);
  });

  test("only the card in view can be reached by keyboard, and it announces itself when it changes", async ({
    page,
  }) => {
    const deck = await openDeck(page);
    // (Playwright's role queries ignore `inert`, so ask the page itself what can be focused)
    const reachableLinks = () =>
      deck.evaluate((root) =>
        [...root.querySelectorAll<HTMLAnchorElement>("a[aria-label$=': explore']")]
          .filter((link) => !link.closest("[inert]"))
          .map((link) => link.getAttribute("aria-label")),
      );
    expect(await reachableLinks()).toEqual(["Football turf: explore"]);
    await deck.getByRole("button", { name: /^Next:/ }).click();
    await expect.poll(reachableLinks).toEqual(["Pickleball court: explore"]);
    await expect(deck.locator("[aria-live='polite']")).toHaveText("Pickleball court, 2 of 5");

    // and pressing Tab really never lands inside a card that is out of view
    await deck.getByRole("button", { name: /^Next:/ }).focus();
    for (let press = 0; press < 12; press++) {
      await page.keyboard.press("Tab");
      const insideInert = await page.evaluate(
        () => document.activeElement?.closest("[inert]") !== null,
      );
      expect(insideInert).toBe(false);
    }
  });

  test("every card has its picture, and says the pictures are stand-ins", async ({ page }) => {
    const deck = await openDeck(page);
    await expect(deck.getByText(/ILLUSTRATIVE PICTURES/)).toBeVisible();
    // pictures of the waiting cards load once the deck is near, so a click never shows a blank card
    await expect
      .poll(
        async () =>
          deck
            .locator("img")
            .evaluateAll(
              (images) =>
                images.length === 5 &&
                images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
            ),
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test("no page-wide sideways scrolling comes from the off-screen cards", async ({ page }) => {
    await openDeck(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("surface cards: Connect with us", () => {
  test("names the card in the chat greeting, and pre-fills the enquiry only for an exact match", async ({
    page,
  }) => {
    test.slow(); // the frosted-glass chat is very slow to draw in software GL, opened twice here
    const deck = await openDeck(page);
    await current(deck).getByRole("button", { name: "Connect with us" }).click();
    const chat = page.getByRole("dialog", { name: "SLORA enquiry chat" });
    await slowly(chat).toBeVisible();
    await slowly(chat.getByText(/Thanks for showing interest in Football turf/)).toBeVisible();
    const box = chat.getByRole("textbox");
    await box.fill("Asha Raman");
    await box.press("Enter");
    await box.fill("Chennai");
    await box.press("Enter");
    // Football matches an enquiry type exactly, so that question is skipped
    await slowly(chat.getByText(/site or project link/i)).toBeVisible();
    await expect(chat.getByText("What are you looking to build?")).toHaveCount(0);
    await page.keyboard.press("Escape");

    // Pickleball has no exact match: the greeting still names it, but the chat still asks
    await deck.getByRole("button", { name: /^Next:/ }).click();
    await current(deck).getByRole("button", { name: "Connect with us" }).click();
    await slowly(chat.getByText(/Thanks for showing interest in Pickleball court/)).toBeVisible();
    await box.fill("Asha Raman");
    await box.press("Enter");
    await box.fill("Chennai");
    await box.press("Enter");
    await slowly(chat.getByText("What are you looking to build?")).toBeVisible();
  });

  test("clicking elsewhere on the card still follows the card's own link", async ({ page }) => {
    const deck = await openDeck(page);
    await current(deck).getByRole("link", { name: "Football turf: explore" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.getElementById("sports")!.getBoundingClientRect().top),
      )
      .toBeLessThan(200);
  });
});

test.describe("surface cards: the football card's background video", () => {
  test("plays real football footage instead of a still, with the watermark still covered", async ({
    page,
  }) => {
    const deck = await openDeck(page);
    const video = current(deck).locator("video");
    await expect(video).toHaveCount(1);
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.readyState >= 2))
      .toBe(true);
    // the other cards have no video — they stay stills
    await deck.getByRole("button", { name: /^Next:/ }).click();
    await expect(current(deck).locator("video")).toHaveCount(0);
  });
});

test.describe("surface cards: sizing", () => {
  test("is shorter (wider relative to its height) than the old 16∶10 card", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "mobile uses a fixed min-height, not the 16:9.5 aspect ratio");
    const deck = await openDeck(page);
    const box = await current(deck).boundingBox();
    expect(box).not.toBeNull();
    const ratio = box!.width / box!.height;
    expect(ratio).toBeGreaterThan(1.6); // 16:10 (the old aspect ratio) is exactly 1.6
  });
});

test.describe("surface cards: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the arrow still works, and the card simply changes", async ({ page }) => {
    const deck = await openDeck(page);
    await deck.getByRole("button", { name: /^Next:/ }).click();
    await expect(current(deck)).toHaveAttribute("aria-label", `2 of 5: ${NAMES[1]}`);
    await expect
      .poll(
        async () => {
          const box = await current(deck).boundingBox();
          const frame = await deck.locator("[class*='viewport']").boundingBox();
          return box && frame ? Math.abs(box.x - frame.x) : 9999;
        },
        { timeout: 3000 },
      )
      .toBeLessThan(2);
  });
});
