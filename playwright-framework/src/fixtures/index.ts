// EN: Import mergeTests utility from Playwright to combine fixtures
import { mergeTests } from '@playwright/test';
import { baseFixture } from './base.fixture';
import { authFixture } from './auth.fixture';
import { dataFixture } from './data.fixture';
import { loggingFixture } from './logging.fixture';
import { apiAuthFixture } from './api-auth.fixture';

/**
 * EN: Merged test fixture combining all fixture layers (base, auth, data, logging).
 *     Import `test` and `expect` from this module in your test files.
 */
export const test = mergeTests(
  baseFixture,
  authFixture,
  dataFixture,
  loggingFixture,
);

/**
 * EN: Parallel-safe test fixture for API tests with per-worker token isolation.
 *     Import `apiTest` from this module for parallel API test files.
 */
export const apiTest = mergeTests(
  apiAuthFixture,
  dataFixture,
  loggingFixture,
);

export { expect } from '@playwright/test';
