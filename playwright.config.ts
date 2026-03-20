import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isGithubActions,
  retries: isGithubActions ? 2 : 0,
  workers: isGithubActions ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !isGithubActions,
    timeout: 180_000,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: process.env.PORT ?? "3000",
    },
  },
});
