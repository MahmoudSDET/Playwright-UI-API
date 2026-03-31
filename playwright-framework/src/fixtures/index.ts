// EN: Import mergeTests utility from Playwright to combine fixtures
import { mergeTests } from '@playwright/test';
import { baseFixture } from './base.fixture';
import { authFixture } from './auth.fixture';
import { dataFixture } from './data.fixture';
import { loggingFixture } from './logging.fixture';

/**
 * EN: Merged test fixture combining all fixture layers (base, auth, data, logging).
 *     Import `test` and `expect` from this module in your test files.
 *     Ø§Ø³ØªÙˆØ±Ø¯ `test` Ùˆ `expect` Ù…Ù† Ù‡Ø°Ø§ Ø§Ù„Ù…Ù„Ù ÙÙŠ Ù…Ù„ÙØ§Øª Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±.
 */
export const test = mergeTests(
  baseFixture,
  authFixture,
  dataFixture,
  loggingFixture,
);
export { expect } from '@playwright/test';
