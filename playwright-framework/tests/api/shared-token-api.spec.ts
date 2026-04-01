// EN: Import fixtures and API classes for shared token pattern
import { apiTest as test, expect } from '../../src/fixtures/index';
import { AuthAPI } from '../../src/api/clients/AuthAPI';
import { RequestInterceptor } from '../../src/api/interceptors/RequestInterceptor';
import { ConfigManager } from '../../src/core/config/ConfigManager';

/**
 * EN: Shared Token API Tests - demonstrates login-once, share-across-all-tests pattern.
 *     Uses loginShared() in beforeAll to set ONE token that all workers can use.
 *     Ideal for read-only API tests that don't need unique auth per worker.
 */
test.describe('Shared Token API Tests', () => {
  // EN: Force parallel execution within this describe block
  test.describe.configure({ mode: 'parallel' });

  let sharedUserId: string;

  // EN: Login once before all tests and store a shared token
  test.beforeAll(async ({ request }) => {
    const config = ConfigManager.getInstance().getConfig();
    const authAPI = new AuthAPI(request);
    const response = await authAPI.loginShared({
      userEmail: config.credentials.email,
      userPassword: config.credentials.password,
    });
    sharedUserId = response.userId;
  });

  // EN: Cleanup shared token after all tests
  test.afterAll(async () => {
    RequestInterceptor.clearSharedAuthToken();
  });

  test('should fetch products with shared token', async ({ workerOrderAPI }) => {
    await test.step('Fetch all products using shared token', async () => {
      const response = await workerOrderAPI.getAllProducts();
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  test('should fetch orders with shared token', async ({ workerOrderAPI }) => {
    await test.step(`Fetch orders for shared user: ${sharedUserId}`, async () => {
      const response = await workerOrderAPI.getOrdersForCustomer(sharedUserId);
      expect(response.data).toBeDefined();
    });
  });
});
