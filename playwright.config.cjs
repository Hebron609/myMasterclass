const { defineConfig } = require("@playwright/test");
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";
module.exports = defineConfig({
  testDir: "./tests/browser",
  timeout: 90000,
  expect: { timeout: 30000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    headless: true,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${new URL(baseURL).port || 3100}`,
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
