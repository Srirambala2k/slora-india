import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // The 3D scene is drawn in software on machines without a GPU, so run only a couple of tests
  // at once and allow for slower pages.
  workers: process.env.CI ? 1 : 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  // One retry everywhere: this machine is shared and draws graphics in software, so a rare stall
  // is a real possibility. A test that only passes on the retry is still reported as "flaky".
  retries: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Recording a trace (screenshots + page snapshots) on EVERY test made the software-drawn,
    // frosted-glass chat 2–3× slower and pushed tests past their time limits (measured), so it is
    // only recorded when a test is retried (CI retries once). For a local failure: --trace on.
    trace: "on-first-retry",
    // Headless machines have no GPU: use software WebGL so the 3D turf can run in tests.
    launchOptions: {
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // CI builds first (see .github/workflows/ci.yml) and serves the production build.
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
