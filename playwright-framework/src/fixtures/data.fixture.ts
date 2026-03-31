// EN: Import base fixture and test data factory
import { baseFixture } from './base.fixture';
import { TestDataFactory } from '../data/factories/TestDataFactory';
import { CreateUserRequest } from '../api/models/UserModels';
import { CreateOrderRequest } from '../api/models/OrderModels';

/**
 * EN: Type for data fixtures - provides pre-built test data.
 */
export type DataFixtures = {
  testUser: CreateUserRequest;
  testOrder: CreateOrderRequest;
};

/**
 * EN: Data fixture that generates fresh test data for each test.
 */
export const dataFixture = baseFixture.extend<DataFixtures>({
  // EN: Generate a unique test user | AR: ØªÙˆÙ„ÙŠØ¯ Ù…Ø³ØªØ®Ø¯Ù… Ø§Ø®ØªØ¨Ø§Ø± ÙØ±ÙŠØ¯
  testUser: async ({}, use) => {
    const user = TestDataFactory.createUniqueUser();
    await use(user);
  },

  // EN: Generate a standard test order | AR: ØªÙˆÙ„ÙŠØ¯ Ø·Ù„Ø¨ Ø§Ø®ØªØ¨Ø§Ø± Ù‚ÙŠØ§Ø³ÙŠ
  testOrder: async ({}, use) => {
    const order = TestDataFactory.createStandardOrder('product-id-placeholder');
    await use(order);
  },
});
