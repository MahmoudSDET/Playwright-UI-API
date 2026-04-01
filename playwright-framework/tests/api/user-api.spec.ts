// EN: Import parallel-safe API test fixtures and test data factory
import { apiTest as test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/data/factories/TestDataFactory';

/**
 * EN: User API Tests - validates user registration and login flow via API.
 *     Uses worker-scoped tokens for parallel-safe execution.
 */
test.describe('User API Tests', () => {
  // EN: Enable parallel execution within this describe block
  test.describe.configure({ mode: 'parallel' });

  // EN: Test user registration
  test('should register a new user via API', async ({ workerUserAPI }) => {
    const userData = TestDataFactory.createUniqueUser();
    await test.step(`Register user with email: ${userData.userEmail}`, async () => {
      const response = await workerUserAPI.registerUser(userData);
      expect(response.message).toContain('Registered');
    });
  });

  // EN: Test register then login flow
  test('should login with newly registered user', async ({ workerUserAPI, workerAuthAPI }) => {
    const uniqueId = Date.now().toString();
    const userData = TestDataFactory.createUniqueUser(uniqueId);
    await test.step(`Register user: ${userData.userEmail}`, async () => {
      await workerUserAPI.registerUser(userData);
    });
    await test.step(`Login with registered user: ${userData.userEmail}`, async () => {
      const loginResponse = await workerAuthAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      expect(loginResponse.token).toBeTruthy();
      expect(loginResponse.userId).toBeTruthy();
    });
  });
});
