import { test, expect } from '../../src/fixtures/index';

test.describe('Order API Tests', () => {
  let token: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/ecom/auth/login', {
      data: {
        userEmail: 'testpom2026@example.com',
        userPassword: 'Test@12345',
      },
    });
    const body = await response.json();
    token = body.token;
    userId = body.userId;
  });

  test('should get all products', async ({ orderAPI }) => {
    const response = await orderAPI.getAllProducts(token);
    expect(response.data).toBeDefined();
    expect(response.data.length).toBeGreaterThan(0);
  });

  test('should get orders for customer', async ({ orderAPI }) => {
    const response = await orderAPI.getOrdersForCustomer(userId, token);
    expect(response.data).toBeDefined();
  });
});
