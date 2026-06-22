import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for MOTO-ZÜRICH E2E tests.
 *
 * BASE_URL is read from environment variable so the same tests run against:
 *  - Production:    BASE_URL=https://motozuerich.ch  npm test
 *  - Staging:       BASE_URL=https://staging.motozuerich.ch  npm test
 *  - Local dev:     BASE_URL=http://localhost:3000  npm test
 *
 * Default is the current production site.
 */
const BASE_URL = process.env.BASE_URL || 'https://motozuerich.ch';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    locale: 'de-CH',
    timezoneId: 'Europe/Zurich',
    ignoreHTTPSErrors: false,
    extraHTTPHeaders: {
      'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
    },
  },

  expect: {
    timeout: 7_000,
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'desktop-safari',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  outputDir: 'test-results',
});
