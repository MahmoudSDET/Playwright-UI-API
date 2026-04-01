// EN: Import the parallel-safe API test fixture
import { apiTest as test, expect } from '../../src/fixtures/index';

/**
 * EN: Parallel API Tests - demonstrates worker-scoped token isolation.
 *     Each test gets its own authenticated API clients via the apiTest fixture.
 *     Safe to run with fullyParallel: true and multiple workers.
 */
test.describe('Parallel API Tests - Worker-Scoped Tokens', () => {
  // EN: Force parallel execution within this describe block
  test.describe.configure({ mode: 'parallel' });

  // EN: Each test auto-authenticates via workerAuth fixture (per-worker token)

  test('worker should get all products independently', async ({ workerOrderAPI, workerAuth }) => {
    await test.step(`Authenticated as userId: ${workerAuth.userId}`, async () => {
      const response = await workerOrderAPI.getAllProducts();
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  test('worker should get orders for customer', async ({ workerOrderAPI, workerAuth }) => {
    await test.step(`Fetch orders for worker's user: ${workerAuth.userId}`, async () => {
      const response = await workerOrderAPI.getOrdersForCustomer(workerAuth.userId);
      expect(response.data).toBeDefined();
    });
  });

  test('worker should create and verify order', async ({ workerOrderAPI, workerAuth }) => {
    await test.step(`Create order for worker's user: ${workerAuth.userId}`, async () => {
      // EN: First get a product to order
      const products = await workerOrderAPI.getAllProducts();
      expect(products.data.length).toBeGreaterThan(0);
      const productId = products.data[0]._id;

      // EN: Create an order with that product
      const orderResponse = await workerOrderAPI.createOrder({
        orders: [{ country: 'India', productOrderedId: productId }],
      });
      expect(orderResponse.orders).toBeDefined();
      expect(orderResponse.productOrderId.length).toBeGreaterThan(0);
    });
  });
});
