import { expect, test, type Page } from "@playwright/test";

const waitForReady = (page: Page) =>
  page.waitForFunction(() => document.documentElement.dataset.stage === "ready", null, {
    timeout: 45_000,
  });

const WHATSAPP = "https://wa.me/919384746930";
const TEL = "tel:+919384746930";
const MAPS =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    "3, Anna St, Ranga Colony, Kamarajapuram, Sembakkam, Tambaram, Tamil Nadu 600073",
  );
const INSTAGRAM = "https://www.instagram.com/sloraindia/";

test.describe("hero: contact button and Instagram", () => {
  test("the CONTACT US button opens a menu with WhatsApp, Call and Google Maps, each a real link", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    const trigger = page.getByRole("button", { name: /CONTACT US/ });
    await expect(trigger).toBeVisible();
    await expect(page.getByRole("menu")).toHaveCount(0);

    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      new RegExp(`^${WHATSAPP.replace(/\./g, "\\.")}`),
    );
    await expect(menu.getByRole("menuitem", { name: /^Call/ })).toHaveAttribute("href", TEL);
    await expect(menu.getByRole("menuitem", { name: /Google Maps/ })).toHaveAttribute("href", MAPS);
    // opens in a new tab, except the plain phone call
    await expect(menu.getByRole("menuitem", { name: "WhatsApp" })).toHaveAttribute(
      "target",
      "_blank",
    );

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("clicking outside the open menu closes it", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await page.getByRole("button", { name: /CONTACT US/ }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByRole("menu")).toBeHidden();
  });

  test("the hero's Instagram icon links to the real SLORA account, in a new tab", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    // scoped to the hero: About further down the page has its own Instagram icon too
    const link = page.locator("#top").getByRole("link", { name: /Instagram/i });
    await expect(link).toHaveAttribute("href", INSTAGRAM);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });
});

test.describe("About", () => {
  test("links to SLORA's Instagram (icon and handle)", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await expect(about.getByRole("link", { name: /Instagram/i })).toHaveAttribute(
      "href",
      INSTAGRAM,
    );
    await expect(about.getByText("@sloraindia")).toHaveAttribute("href", INSTAGRAM);
  });

  test("shows the founder's story and the two real numbers as a stats sidebar, with no photo", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await expect(about.getByText("Lohith Raghuraman", { exact: true })).toBeVisible();
    await expect(about.getByText(/100\+ previously executed projects/)).toBeVisible();
    const stats = about.getByRole("complementary", { name: "SLORA in numbers" });
    await expect(stats.getByText("100+")).toBeVisible();
    await expect(stats.getByText("Projects executed")).toBeVisible();
    await expect(stats.getByText("2026")).toBeVisible();
    await expect(stats.getByText("Founded")).toBeVisible();
    await expect(about.locator("img")).toHaveCount(0);
  });

  test("Contact us jumps to the Contact section, WhatsApp and Enquire go to the right places", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();

    const whatsapp = about.getByRole("link", { name: "WhatsApp" });
    await expect(whatsapp).toHaveAttribute(
      "href",
      new RegExp(`^${WHATSAPP.replace(/\./g, "\\.")}`),
    );
    await expect(whatsapp).toHaveAttribute("target", "_blank");

    await about.getByRole("link", { name: "Contact us →" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.getElementById("contact")!.getBoundingClientRect().top),
      )
      .toBeLessThan(200);

    await about.scrollIntoViewIfNeeded();
    await about.getByRole("button", { name: "Enquire" }).click();
    await expect(page.getByRole("dialog", { name: "SLORA enquiry chat" })).toBeVisible();
  });
});

test.describe("How We Build", () => {
  test("Contact us and Enquire sit under the heading and go to the right places", async ({
    page,
  }) => {
    await page.goto("/?journey=video");
    await waitForReady(page);
    const process = page.locator("#process");
    await process.scrollIntoViewIfNeeded();

    await process.getByRole("button", { name: "Enquire" }).click();
    await expect(page.getByRole("dialog", { name: "SLORA enquiry chat" })).toBeVisible();
    await page.keyboard.press("Escape");

    await process.getByRole("link", { name: "Contact us →" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.getElementById("contact")!.getBoundingClientRect().top),
      )
      .toBeLessThan(200);
  });
});

test.describe("Contact", () => {
  test("the address opens Google Maps, and the phone number has separate WhatsApp and Call buttons", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForReady(page);
    const section = page.locator("#contact");
    await section.scrollIntoViewIfNeeded();

    await expect(section.getByText("3, Anna St, Ranga Colony")).toBeVisible();
    await expect(section.getByText("Kamarajapuram, Sembakkam, Tambaram")).toBeVisible();
    await expect(section.getByText("Tamil Nadu 600073")).toBeVisible();
    const mapLink = section.getByRole("link", { name: /Open SLORA's address in Google Maps/i });
    await expect(mapLink).toHaveAttribute("href", MAPS);
    await expect(mapLink).toHaveAttribute("target", "_blank");

    await expect(section.getByText("+91 93847 46930")).toBeVisible();
    const whatsapp = section.getByRole("link", { name: "WhatsApp" });
    const call = section.getByRole("link", { name: "Call" });
    await expect(whatsapp).toHaveAttribute(
      "href",
      new RegExp(`^${WHATSAPP.replace(/\./g, "\\.")}`),
    );
    await expect(call).toHaveAttribute("href", TEL);
    // two distinct destinations, as asked — not the same link twice
    expect(await whatsapp.getAttribute("href")).not.toBe(await call.getAttribute("href"));
  });

  test("has no page-wide sideways scrolling", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await page.locator("#contact").scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
