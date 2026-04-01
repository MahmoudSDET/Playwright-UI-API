// EN: Import parallel-safe API test fixtures
import { apiTest as test, expect } from '../../src/fixtures/index';

/**
 * EN: Order API Tests - validates product listing and order operations via API.
 *     Uses worker-scoped tokens for parallel-safe execution.
 */
test.describe('Order API Tests', () => {
  // EN: Enable parallel execution within this describe block
  test.describe.configure({ mode: 'parallel' });

  // EN: Test fetching all products (workerAuth auto-authenticates per worker)
  test('should get all products', async ({ workerOrderAPI, workerAuth }) => {
    await test.step('Fetch all products via API', async () => {
      const response = await workerOrderAPI.getAllProducts();
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  // EN: Test fetching orders for a customer
  test('should get orders for customer', async ({ workerOrderAPI, workerAuth }) => {
    await test.step(`Fetch orders for customer: ${workerAuth.userId}`, async () => {
      const response = await workerOrderAPI.getOrdersForCustomer(workerAuth.userId);
      expect(response.data).toBeDefined();
    });
  });

  // EN: Test creating an order
  test('should create an order', async ({ workerOrderAPI, workerAuth }) => {
    await test.step('Create order with first available product', async () => {
      const products = await workerOrderAPI.getAllProducts();
      expect(products.data.length).toBeGreaterThan(0);
      const productId = products.data[0]._id;

      const orderResponse = await workerOrderAPI.createOrder({
        orders: [{ country: 'Egypt', productOrderedId: productId }],
      });
      expect(orderResponse.orders).toBeDefined();
      expect(orderResponse.productOrderId.length).toBeGreaterThan(0);
    });
  });
});
