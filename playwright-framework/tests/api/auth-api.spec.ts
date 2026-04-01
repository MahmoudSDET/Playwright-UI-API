// EN: Import parallel-safe API test fixtures
import { apiTest as test, expect } from '../../src/fixtures/index';

/**
 * EN: Auth API Tests - validates login and registration via API endpoints.
 *     Uses worker-scoped tokens for parallel-safe execution.
 */
test.describe('Auth API Tests', () => {
  // EN: Enable parallel execution within this describe block
  test.describe.configure({ mode: 'parallel' });

  // EN: Test successful login returns token (workerAuth auto-authenticates)
  test('should login via API with valid credentials', async ({ workerAuth }) => {
    await test.step(`Verify login response for userId: ${workerAuth.userId}`, async () => {
      expect(workerAuth.token).toBeTruthy();
      expect(workerAuth.userId).toBeTruthy();
    });
  });

  // EN: Test failed login throws error
  test('should fail login with invalid credentials', async ({ workerAuthAPI }) => {
    const userEmail = 'invalid@example.com';
    await test.step(`Login with email: ${userEmail}`, async () => {
      await expect(
        workerAuthAPI.login({ userEmail, userPassword: 'wrong' }),
      ).rejects.toThrow();
    });
  });

  // EN: Test user registration via API
  test('should register a new user via API', async ({ workerAuthAPI }) => {
    const uniqueId = Date.now().toString();
    const userEmail = `testapi_${uniqueId}@example.com`;
    await test.step(`Register with email: ${userEmail}`, async () => {
      const response = await workerAuthAPI.register({
        firstName: 'Test',
        lastName: 'User',
        userEmail,
        userPassword: 'Test@12345',
        confirmPassword: 'Test@12345',
        userMobile: '1234567890',
        occupation: 'Student',
        gender: 'Male',
        required18: true,
      });
      expect(response.message).toContain('Registered');
    });
  });
});
