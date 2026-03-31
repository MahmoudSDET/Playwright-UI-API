// EN: Import test fixtures
import { test, expect } from '../../src/fixtures/index';

/**
 * EN: Order API Tests - validates product listing and order retrieval via API.
 *     Uses beforeAll to login once and share token across tests.
 *     ÙŠØ³ØªØ®Ø¯Ù… beforeAll Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø© ÙˆÙ…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ø±Ù…Ø² Ø¨ÙŠÙ† Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª.
 */
test.describe('Order API Tests', () => {
  // EN: Shared auth token and userId | AR: Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ÙˆÙ…Ø¹Ø±Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø´ØªØ±ÙƒÙŠÙ†
  let userId: string;
  const userEmail = 'testpom2026@example.com';

  // EN: Login once before all tests and set auth token via AuthAPI
  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../src/api/clients/AuthAPI');
    const authAPI = new AuthAPI(request);
    const response = await authAPI.login({
      userEmail,
      userPassword: 'Test@12345',
    });
    userId = response.userId;
  });

  // EN: Test fetching all products | AR: Ø§Ø®ØªØ¨Ø§Ø± Ø¬Ù„Ø¨ ÙƒÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
  test('should get all products', async ({ orderAPI }) => {
    await test.step('Fetch all products via API', async () => {
      const response = await orderAPI.getAllProducts();
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  // EN: Test fetching orders for a customer | AR: Ø§Ø®ØªØ¨Ø§Ø± Ø¬Ù„Ø¨ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ù„Ø¹Ù…ÙŠÙ„
  test('should get orders for customer', async ({ orderAPI }) => {
    await test.step(`Fetch orders for customer: ${userId}`, async () => {
      const response = await orderAPI.getOrdersForCustomer(userId);
      expect(response.data).toBeDefined();
    });
  });
});
