// EN: Import Playwright config helpers and dotenv for environment variables
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// EN: Load environment variables from .env.[local|staging|production] file
const env = process.env.ENV || 'local';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

/**
 * EN: Main Playwright configuration.
 */
export default defineConfig({
  // EN: Root directory for test files
  testDir: './tests',
  // EN: Don't run tests in parallel by default (serial mode for UI tests)
  fullyParallel: false,
  // EN: Fail CI if test.only is left in code
  forbidOnly: !!process.env.CI,
  // EN: Retry failed tests (2 in CI, 0 locally)
  retries: process.env.CI ? 2 : 0,
  // EN: Number of parallel workers
  workers: process.env.CI ? 2 : 4,
  // EN: Global test timeout (30 seconds)
  timeout: 30_000,
  expect: {
    // EN: Assertion timeout (10 seconds)
    timeout: 10_000,
  },

  // EN: Configure reporters: HTML, list (console), and Allure
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],

  // EN: Shared settings for all projects
  use: {
    // EN: Base URL for the application under test
    baseURL: process.env.BASE_URL || 'https://rahulshettyacademy.com/client/',
    // EN: Capture trace on first retry, retain on first failure for debugging (v1.43)
    trace: 'retain-on-first-failure',
    // EN: Take screenshot on first failure — captures immediately without retry (v1.49)
    screenshot: {
      mode: 'on-first-failure',
      fullPage: true,
    },
    // EN: Keep video recording only on failure
    video: 'retain-on-failure',
    // EN: Timeout for individual actions (click, fill, etc.)
    actionTimeout: 15_000,
    // EN: Timeout for page navigations
    navigationTimeout: 15_000,
  },

  // EN: Browser projects to run tests against
  projects: [
    // EN: API tests run in parallel with per-worker token isolation
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        // EN: API base URL (no browser needed)
        baseURL: process.env.API_URL || 'https://rahulshettyacademy.com',
      },
      fullyParallel: true,
    },

    // EN: UI tests run on Chromium
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },

    // EN: UI tests on Firefox
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
    },

    // EN: UI tests on WebKit
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
    },

    // EN: Hybrid tests (UI + API)
    {
      name: 'hybrid',
      testDir: './tests/hybrid',
      use: { ...devices['Desktop Chrome'] },
    },

    // EN: Mobile tests
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // EN: Output directory for test artifacts (screenshots, etc.)
  outputDir: 'reports/screenshots',
});
