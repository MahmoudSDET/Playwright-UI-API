// EN: Import Playwright's base test for extending with custom fixtures
import { test as base } from '@playwright/test';
// EN: Import the centralized Logger
import { Logger } from '../logger/Logger';

/**
 * EN: Base test class providing lifecycle hooks and common test utilities.
 *     Extends Playwright's base test with shared setup/teardown logic.
 *     ÙŠÙˆØ³Ø¹ Ø§Ø®ØªØ¨Ø§Ø± Playwright Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ø¨Ù…Ù†Ø·Ù‚ Ø¥Ø¹Ø¯Ø§Ø¯/ØªÙ†Ø¸ÙŠÙ Ù…Ø´ØªØ±Ùƒ.
 */
export const BaseTest = base.extend<{ logger: Logger }>({
  // EN: Logger fixture - creates a logger, logs test start/end, and provides it to the test
  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('--- Test starting ---');
    await use(logger);
    logger.info('--- Test finished ---');
  },
});
