import { mergeTests } from '@playwright/test';
import { baseFixture } from './base.fixture';
import { authFixture } from './auth.fixture';
import { dataFixture } from './data.fixture';

/**
 * Merged test fixture combining all fixture layers.
 * Import `test` and `expect` from this module in your test files.
 */
export const test = mergeTests(baseFixture, authFixture, dataFixture);
export { expect } from '@playwright/test';
