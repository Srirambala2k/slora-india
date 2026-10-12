import { expect, test, type Page } from "@playwright/test";

const waitForReady = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.stage === "ready", null, {
    timeout: 45_000,
  });

test.describe("Projects", () => {
  test("shows a card per project, and a card opens its detail view with clips", async ({
    page,
  }) => {
    await page.goto("/?journey=light");
    await waitForReady(page);
    const section = page.locator("#projects");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("our work");
    await expect(section.locator("[data-project]")).toHaveCount(5);

    await section.locator('[data-project="tbm-pickleball"]').click();
    const dialog = page.getByRole("dialog", { name: "TBM Pickleball project" });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/#projects\/tbm-pickleball$/);
    await expect(dialog).toContainText("CLIP 01 / 07");
    await dialog.getByRole("button", { name: "Next clip" }).click();
    await expect(dialog).toContainText("CLIP 02 / 07");

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/#projects$/);
  });

  test("a shared link opens the project straight away", async ({ page }) => {
    await page.goto("/?journey=light#projects/vellore-turf");
    await waitForReady(page);
    await expect(page.getByRole("dialog", { name: "Vellore Turf project" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
