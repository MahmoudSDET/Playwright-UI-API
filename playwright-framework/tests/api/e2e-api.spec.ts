// EN: Import Playwright base test (no fixture auto-login — we register fresh users)
import { test, expect } from '@playwright/test';
import { AuthAPI } from '../../src/api/clients/AuthAPI';
import { OrderAPI } from '../../src/api/clients/OrderAPI';
import { TestDataFactory } from '../../src/data/factories/TestDataFactory';

/**
 * EN: ====== CONTROL PANEL ======
 *     NUM_USERS: How many parallel users to simulate.
 *     Each user runs the full E2E flow: Register → Login → Browse → Order → Verify.
 *     Workers in playwright.config.ts controls how many run simultaneously.
 *
 *     Examples:
 *       NUM_USERS=3, workers=2 → 3 users across 2 workers (2 parallel + 1 queued)
 *       NUM_USERS=5, workers=4 → 5 users across 4 workers
 *       NUM_USERS=1, workers=1 → single user, single worker (sequential)
 *
 *     غيّر NUM_USERS عشان تتحكم في عدد المستخدمين.
 *     غيّر workers في playwright.config.ts عشان تتحكم في عدد الـ workers.
 */
const NUM_USERS = Number(process.env.NUM_USERS) || 3;

for (let i = 0; i < NUM_USERS; i++) {
  // EN: Each user gets a serial describe — steps run in order.
  //     Different user describes run in PARALLEL across workers.
  //     Title must be deterministic (no Date.now()) — Playwright requires
  //     titles to match between main process and worker process.
  test.describe(`E2E User ${i + 1}/${NUM_USERS}`, () => {
    test.describe.configure({ mode: 'serial' });

    // EN: Short unique suffix to keep firstName/lastName under 20 chars (API limit)
    const shortId = `${Date.now() % 100000}${i}`;
    const userData = TestDataFactory.createUniqueUser(shortId);

    // EN: Shared state across serial steps for this user
    let userId: string;
    let productId: string;
    let orderId: string;

    test('Step 1: Register new user', async ({ request }) => {
      const authAPI = new AuthAPI(request);
      const response = await authAPI.register(userData);
      expect(response.message).toContain('Registered');
    });

    test('Step 2: Login with new credentials', async ({ request }) => {
      const authAPI = new AuthAPI(request);
      const loginResponse = await authAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      expect(loginResponse.token).toBeTruthy();
      expect(loginResponse.userId).toBeTruthy();
      userId = loginResponse.userId;
    });

    test('Step 3: Browse and select a product', async ({ request }) => {
      // EN: Re-login (each test gets a fresh request context in Playwright)
      const authAPI = new AuthAPI(request);
      await authAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      const orderAPI = new OrderAPI(request);

      const products = await orderAPI.getAllProducts();
      expect(products.data).toBeDefined();
      expect(products.data.length).toBeGreaterThan(0);

      // EN: Pick a product (rotate by user index to spread across products)
      productId = products.data[i % products.data.length]._id;
      expect(productId).toBeTruthy();
    });

    test('Step 4: Create order with selected product', async ({ request }) => {
      const authAPI = new AuthAPI(request);
      const loginResp = await authAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      userId = loginResp.userId;
      const orderAPI = new OrderAPI(request);

      const orderResponse = await orderAPI.createOrder({
        orders: [{ country: 'Egypt', productOrderedId: productId }],
      });
      expect(orderResponse.orders).toBeDefined();
      expect(orderResponse.orders.length).toBeGreaterThan(0);
      expect(orderResponse.message).toContain('Order Placed');
      orderId = orderResponse.orders[0];
    });

    test('Step 5: Verify order exists for this user', async ({ request }) => {
      const authAPI = new AuthAPI(request);
      const loginResp = await authAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      userId = loginResp.userId;
      const orderAPI = new OrderAPI(request);

      const orders = await orderAPI.getOrdersForCustomer(userId);
      expect(orders.data).toBeDefined();
      expect(orders.data.length).toBeGreaterThan(0);

      // EN: Verify our specific order is present
      const myOrder = orders.data.find((o: any) => o._id === orderId);
      expect(myOrder).toBeDefined();
    });

    test('Step 6: Delete order (cleanup)', async ({ request }) => {
      const authAPI = new AuthAPI(request);
      await authAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      const orderAPI = new OrderAPI(request);

      const deleteResponse = await orderAPI.deleteOrder(orderId);
      expect(deleteResponse.message).toBeDefined();
    });
  });
}
