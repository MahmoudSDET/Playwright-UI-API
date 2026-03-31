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
  // EN: Root directory for test files | AR: Ø§Ù„Ù…Ø¬Ù„Ø¯ Ø§Ù„Ø¬Ø°Ø±ÙŠ Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
  testDir: './tests',
  // EN: Don't run tests in parallel (serial mode) | AR: Ù„Ø§ ØªØ´ØºÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª Ø¨Ø§Ù„ØªÙˆØ§Ø²ÙŠ (ÙˆØ¶Ø¹ ØªØ³Ù„Ø³Ù„ÙŠ)
  fullyParallel: false,
  // EN: Fail CI if test.only is left in code | AR: ÙØ´Ù„ CI Ø¥Ø°Ø§ ØªØ±ÙƒØª test.only ÙÙŠ Ø§Ù„ÙƒÙˆØ¯
  forbidOnly: !!process.env.CI,
  // EN: Retry failed tests (2 in CI, 0 locally) | AR: Ø¥Ø¹Ø§Ø¯Ø© Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª Ø§Ù„ÙØ§Ø´Ù„Ø© (2 ÙÙŠ CIØŒ 0 Ù…Ø­Ù„ÙŠÙ‹Ø§)
  retries: process.env.CI ? 2 : 0,
  // EN: Number of parallel workers | AR: Ø¹Ø¯Ø¯ Ø§Ù„Ø¹Ù…Ø§Ù„ Ø§Ù„Ù…ØªÙˆØ§Ø²ÙŠÙŠÙ†
  workers: process.env.CI ? 1 : 1,
  // EN: Global test timeout (30 seconds) | AR: Ù…Ù‡Ù„Ø© Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø¹Ø§Ù…Ø© (30 Ø«Ø§Ù†ÙŠØ©)
  timeout: 30_000,
  expect: {
    // EN: Assertion timeout (10 seconds) | AR: Ù…Ù‡Ù„Ø© Ø§Ù„ØªØ­Ù‚Ù‚ (10 Ø«ÙˆØ§Ù†ÙŠ)
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
    // EN: Base URL for the application under test | AR: Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ù…ÙØ®ØªØ¨Ø±
    baseURL: process.env.BASE_URL || 'https://rahulshettyacademy.com/client/',
    // EN: Capture trace only on first retry | AR: Ø§Ù„ØªÙ‚Ø§Ø· Ø§Ù„ØªØªØ¨Ø¹ ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø£ÙˆÙ„ Ø¥Ø¹Ø§Ø¯Ø© Ù…Ø­Ø§ÙˆÙ„Ø©
    trace: 'on-first-retry',
    // EN: Take screenshot only on failure (full page) | AR: Ø§Ù„ØªÙ‚Ø§Ø· Ù„Ù‚Ø·Ø© Ø´Ø§Ø´Ø© ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„ (ØµÙØ­Ø© ÙƒØ§Ù…Ù„Ø©)
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    // EN: Keep video recording only on failure | AR: Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨ØªØ³Ø¬ÙŠÙ„ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙÙ‚Ø· Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„
    video: 'retain-on-failure',
    // EN: Timeout for individual actions (click, fill, etc.) | AR: Ù…Ù‡Ù„Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ÙØ±Ø¯ÙŠØ© (Ù†Ù‚Ø±ØŒ ØªØ¹Ø¨Ø¦Ø©ØŒ Ø¥Ù„Ø®)
    actionTimeout: 15_000,
    // EN: Timeout for page navigations | AR: Ù…Ù‡Ù„Ø© Ø§Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„ØµÙØ­Ø§Øª
    navigationTimeout: 15_000,
  },

  // EN: Browser projects to run tests against | AR: Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ù…ØªØµÙØ­Ø§Øª Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // EN: Output directory for test artifacts (screenshots, etc.) | AR: Ù…Ø¬Ù„Ø¯ Ø§Ù„Ø¥Ø®Ø±Ø§Ø¬ Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± (Ù„Ù‚Ø·Ø§Øª Ø´Ø§Ø´Ø©ØŒ Ø¥Ù„Ø®)
  outputDir: 'reports/screenshots',
});
