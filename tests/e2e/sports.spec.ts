import { expect, test, type Locator, type Page } from "@playwright/test";

const waitForReady = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.stage === "ready", null, {
    timeout: 45_000,
  });

/** The frosted-glass chat is very slow to draw in software graphics, so its checks wait longer. */
const slowly = expect.configure({ timeout: 30_000 });

const NAMES = ["Football", "Cricket", "Hockey", "Tennis", "Padel", "Multi-sport", "Athletics"];

async function openHome(page: Page, extra = ""): Promise<Locator> {
  await page.goto(`/?journey=light${extra}`);
  await waitForReady(page);
  return page.locator("#sports");
}

/** The pinned rail is only for computers with a graphics card, which test browsers lack: ask for it. */
const openPinned = (page: Page) => openHome(page, "&sports=pinned");

/** Scroll so the pinned section is `fraction` (0 → 1) of the way through its pinned stretch. */
const scrollSportsTo = (page: Page, fraction: number) =>
  page.evaluate((f) => {
    const section = document.getElementById("sports")!;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (section.offsetHeight - window.innerHeight) * f);
  }, fraction);

/** The row's current sideways shift, in pixels (negative = moved left). */
const rowShift = (page: Page) =>
  page.evaluate(() => {
    const row = document.querySelector("#sports ul") as HTMLElement;
    return new DOMMatrixReadOnly(getComputedStyle(row).transform).m41;
  });

/**
 * Wait until the row has come to rest. After a big scroll jump it keeps swaying for a second or
 * two (its lean follows the scroll speed), and a button that is still moving cannot be clicked.
 */
async function waitForRowToRest(page: Page) {
  let last = "";
  let same = 0;
  await expect
    .poll(
      async () => {
        const now = await page.evaluate(
          () => getComputedStyle(document.querySelector("#sports ul")!).transform,
        );
        same = now === last ? same + 1 : 0;
        last = now;
        return same;
      },
      { intervals: [150], timeout: 30_000 },
    )
    .toBeGreaterThanOrEqual(3);
}

/**
 * Press a panel's button with a real mouse click at its position. (Playwright's own click keeps
 * scrolling the page to "bring it into view", and in the pinned rail one pixel of scroll moves
 * the row one pixel sideways, so it can chase the button for minutes.)
 */
async function pressButton(page: Page, button: Locator) {
  await waitForRowToRest(page);
  const box = await button.boundingBox();
  if (!box) throw new Error("the button has no position on screen");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

const counter = (section: Locator) => section.locator("p", { hasText: /^\d\d \/ 07/ });

test.describe("sports: the pinned rail (desktop)", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "phones get the swipe cards (next group)");
  });

  test("is a tall pinned stage that slides seven panels sideways, from Football to Athletics", async ({
    page,
  }) => {
    const section = await openPinned(page);
    const size = await section.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      vh: window.innerHeight,
    }));
    expect(size.height).toBeGreaterThan(size.vh * 2.5);

    await scrollSportsTo(page, 0);
    await expect(counter(section)).toContainText("01 / 07 · FOOTBALL");
    expect(Math.abs(await rowShift(page))).toBeLessThan(2);

    await scrollSportsTo(page, 0.5);
    await expect.poll(() => rowShift(page)).toBeLessThan(-400);
    await expect(counter(section)).not.toContainText("01 / 07");

    await scrollSportsTo(page, 1);
    await expect(counter(section)).toContainText("07 / 07 · ATHLETICS", { timeout: 10_000 });
    // at the end the last panel sits inside the right-hand side of the screen
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const panels = document.querySelectorAll("#sports li");
          const last = panels[panels.length - 1].getBoundingClientRect();
          return last.right <= window.innerWidth + 1 && last.left >= 0;
        }),
      )
      .toBe(true);
  });

  test("shows the seven categories from the brief, in order, and says the pictures are stand-ins", async ({
    page,
  }) => {
    const section = await openPinned(page);
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(7);
    // (screen readers get the plain name, e.g. "Multi-sport", not the two stacked lines glued together)
    for (const name of NAMES) {
      await expect(section.getByRole("heading", { level: 3, name, exact: true })).toHaveCount(1);
    }
    const order = await section
      .getByRole("heading", { level: 3 })
      .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));
    expect(order).toEqual(NAMES);
    await expect(section.getByText(/ILLUSTRATIVE PICTURES/)).toBeAttached();
    // nothing is invented: no applications or technical details until SLORA supplies them
    await expect(section.getByText(/APPLICATIONS/i)).toHaveCount(0);
  });

  test("the giant word never runs into the tagline below it, even on a short window (Football, Multi-sport)", async ({
    page,
  }) => {
    // A two-line word (only Football and Multi-sport have one) is sized from the viewport's
    // HEIGHT, while the tagline underneath keeps a roughly fixed height — so a window that is
    // wide enough for the pinned rail but not very tall (a resized or un-maximised browser,
    // common on laptops) used to let the word's second line run into the tagline text.
    await page.setViewportSize({ width: 1440, height: 650 });
    const section = await openPinned(page);
    for (const [fraction, name] of [
      [0, "Football"],
      [5 / 6, "Multi-sport"],
    ] as const) {
      await scrollSportsTo(page, fraction);
      const panel = section.getByRole("heading", { level: 3, name, exact: true }).locator("..");
      const wordBottom = await panel
        .locator("h3")
        .evaluate((el) => el.getBoundingClientRect().bottom);
      const bodyTop = await panel
        .locator('[class*="body"]')
        .evaluate((el) => el.getBoundingClientRect().top);
      expect(bodyTop - wordBottom, `${name}: gap between the word and the tagline`).toBeGreaterThan(
        30,
      );
    }
  });

  test("the panel buttons open the chat: Football fills in the enquiry type, Tennis does not guess", async ({
    page,
  }) => {
    test.slow(); // the frosted-glass chat over big pictures is very slow to draw in software GL
    const section = await openPinned(page);
    await scrollSportsTo(page, 0);
    await pressButton(page, section.getByRole("button", { name: /^Ask about Football/ }));
    const chat = page.getByRole("dialog", { name: "SLORA enquiry chat" });
    await slowly(chat).toBeVisible();
    const box = chat.getByRole("textbox");
    await slowly(chat.getByText("What is your name?")).toBeVisible();
    await box.fill("Asha Raman");
    await box.press("Enter");
    await slowly(chat.getByText("Which city is your project in?")).toBeVisible();
    await box.fill("Chennai");
    await box.press("Enter");
    // "what are you looking to build?" is skipped: Football already said so
    await slowly(chat.getByText(/site or project link/i)).toBeVisible();
    await slowly(chat.getByText("What are you looking to build?")).toHaveCount(0);
  });

  test("a panel with no exact match (Tennis) leaves the question for the chat to ask", async ({
    page,
  }) => {
    test.slow(); // (as above)
    const section = await openPinned(page);
    await scrollSportsTo(page, 0.55);
    await pressButton(page, section.getByRole("button", { name: /^Ask about Tennis/ }));
    const chat = page.getByRole("dialog", { name: "SLORA enquiry chat" });
    await slowly(chat).toBeVisible();
    const box = chat.getByRole("textbox");
    await box.fill("Asha Raman");
    await box.press("Enter");
    await box.fill("Chennai");
    await box.press("Enter");
    await slowly(chat.getByText("What are you looking to build?")).toBeVisible();
  });

  test("Tab to a button on a panel that is off screen brings that panel into view", async ({
    page,
  }) => {
    const section = await openPinned(page);
    await scrollSportsTo(page, 0);
    await section.getByRole("button", { name: /^Ask about Athletics/ }).focus();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const panels = document.querySelectorAll("#sports li");
          const last = panels[panels.length - 1].getBoundingClientRect();
          return last.left >= 0 && last.right <= window.innerWidth + 1;
        }),
      )
      .toBe(true);
    // the stage itself was never scrolled sideways by the focus
    expect(
      await page.evaluate(() => {
        const stage = document.querySelector("#sports")!.firstElementChild as HTMLElement;
        return stage.scrollLeft;
      }),
    ).toBe(0);
  });

  test("the menu knows we are in Sports while the rail is showing", async ({ page }) => {
    await openPinned(page);
    await scrollSportsTo(page, 0.4);
    await expect(page.locator("nav a[aria-current='true']")).toContainText(/sports/i);
  });

  test("has no page-wide sideways scrolling", async ({ page }) => {
    await openPinned(page);
    await scrollSportsTo(page, 0.5);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("sports: swipe cards (phones)", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "desktop gets the pinned rail (previous group)");
  });

  test("a row of seven cards that snaps as you swipe, with a counter that follows", async ({
    page,
  }) => {
    const section = await openHome(page);
    await section.scrollIntoViewIfNeeded();
    const rail = section.locator("div[class*='rail']");
    const facts = await rail.evaluate((el) => ({
      snap: getComputedStyle(el).scrollSnapType,
      overflow: el.scrollWidth - el.clientWidth,
    }));
    expect(facts.snap).toContain("x");
    expect(facts.overflow).toBeGreaterThan(300);
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(7);

    // the section is only as tall as its cards, not a giant pinned stage
    const ratio = await section.evaluate((el) => el.getBoundingClientRect().height / innerHeight);
    expect(ratio).toBeLessThan(2);

    await expect(counter(section)).toContainText("01 / 07 · FOOTBALL");
    await section.getByRole("button", { name: "Next sport" }).click();
    await expect(counter(section)).toContainText("02 / 07 · CRICKET", { timeout: 5000 });
    await section.getByRole("button", { name: "Previous sport" }).click();
    await expect(counter(section)).toContainText("01 / 07 · FOOTBALL", { timeout: 5000 });
  });

  test("the page itself never scrolls sideways", async ({ page }) => {
    const section = await openHome(page);
    await section.scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("sports: a computer without a graphics card (desktop)", () => {
  test("gets the native swipe cards by default, because the pinned rail stalls without a graphics card", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "covered by the phone tests");
    // test browsers draw graphics in software, so this is exactly what such a visitor gets
    await page.goto("/");
    await waitForReady(page);
    const section = page.locator("#sports");
    const ratio = await section.evaluate((el) => el.getBoundingClientRect().height / innerHeight);
    expect(ratio).toBeLessThan(2);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("button", { name: "Next sport" })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(7);
  });
});

test.describe("sports: reduced motion (desktop)", () => {
  test.use({ reducedMotion: "reduce" });

  test("the review override cannot force the pinned rail on someone who asked for less motion", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "covered by the phone tests");
    const section = await openHome(page, "&sports=pinned");
    const ratio = await section.evaluate((el) => el.getBoundingClientRect().height / innerHeight);
    expect(ratio).toBeLessThan(2);
  });

  test("gets the plain swipe row with arrows, not the pinned rail", async ({ page, isMobile }) => {
    test.skip(isMobile, "covered by the phone tests");
    const section = await openHome(page);
    const ratio = await section.evaluate((el) => el.getBoundingClientRect().height / innerHeight);
    expect(ratio).toBeLessThan(2);
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Next sport" }).click();
    await expect(counter(section)).toContainText("02 / 07 · CRICKET", { timeout: 5000 });
  });
});
