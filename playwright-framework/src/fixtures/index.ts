import { mergeTests } from '@playwright/test';
import { baseFixture } from './base.fixture';
import { authFixture } from './auth.fixture';
import { dataFixture } from './data.fixture';
import { loggingFixture } from './logging.fixture';

/**
 * Merged test fixture combining all fixture layers.
 * Import `test` and `expect` from this module in your test files.
 */
export const test = mergeTests(
  baseFixture,
  authFixture,
  dataFixture,
  loggingFixture,
);
export { expect } from '@playwright/test';
