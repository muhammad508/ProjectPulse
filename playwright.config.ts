import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const port = 3000;

export default defineConfig({
  testDir: "tests/e2e",
  // Tests share one database, so run them one after another.
  workers: 1,
  fullyParallel: false,
  // Generous assertion timeout: the first requests to a cold server (or a busy CI runner) can be slow.
  expect: { timeout: 10_000 },
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI tests the production build; locally the dev server is reused if it is already running.
    command: isCI ? "npm run build && npm run start" : "npm run dev",
    url: `http://localhost:${port}/login`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
