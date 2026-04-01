// EN: Import Playwright base test and API classes for shared token pattern
import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../src/api/clients/AuthAPI';
import { OrderAPI } from '../../src/api/clients/OrderAPI';
import { RequestInterceptor } from '../../src/api/interceptors/RequestInterceptor';
import { ConfigManager } from '../../src/core/config/ConfigManager';

/**
 * EN: Shared Token API Tests - demonstrates login-once, share-across-all-tests pattern.
 *     Uses loginShared() in beforeAll to set ONE token that all tests in this worker use.
 *     API clients created without workerIndex will resolve the shared token automatically.
 *     Ideal for read-only API tests that don't need unique auth per test.
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

  test('should fetch products with shared token', async ({ request }) => {
    await test.step('Fetch all products using shared token', async () => {
      // EN: Create OrderAPI without workerIndex - uses shared token via getWorkerHeaders(undefined)
      const orderAPI = new OrderAPI(request);
      const response = await orderAPI.getAllProducts();
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  test('should fetch orders with shared token', async ({ request }) => {
    await test.step(`Fetch orders for shared user: ${sharedUserId}`, async () => {
      // EN: Create OrderAPI without workerIndex - resolves shared token automatically
      const orderAPI = new OrderAPI(request);
      const response = await orderAPI.getOrdersForCustomer(sharedUserId);
      expect(response.data).toBeDefined();
    });
  });
});
