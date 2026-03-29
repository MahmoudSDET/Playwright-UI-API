import { test as base } from '@playwright/test';
import { Logger } from '../logger/Logger';

/**
 * Base test class providing lifecycle hooks and common test utilities.
 * Extend Playwright's base test with shared setup/teardown logic.
 */
export const BaseTest = base.extend<{ logger: Logger }>({
  logger: async ({}, use) => {
    const logger = Logger.getInstance();
    logger.info('--- Test starting ---');
    await use(logger);
    logger.info('--- Test finished ---');
  },
});
