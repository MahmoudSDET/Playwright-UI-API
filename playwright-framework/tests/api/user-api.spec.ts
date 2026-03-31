// EN: Import test fixtures and test data factory
import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/data/factories/TestDataFactory';

/**
 * EN: User API Tests - validates user registration and login flow via API.
 */
test.describe('User API Tests', () => {
  // EN: Test user registration | AR: Ø§Ø®ØªØ¨Ø§Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  test('should register a new user via API', async ({ userAPI }) => {
    const userData = TestDataFactory.createUniqueUser();
    await test.step(`Register user with email: ${userData.userEmail}`, async () => {
      const response = await userAPI.registerUser(userData);
      expect(response.message).toContain('Registered');
    });
  });

  // EN: Test register then login flow | AR: Ø§Ø®ØªØ¨Ø§Ø± ØªØ¯ÙÙ‚ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø«Ù… Ø§Ù„Ø¯Ø®ÙˆÙ„
  test('should login with newly registered user', async ({ userAPI, authAPI }) => {
    const uniqueId = Date.now().toString();
    const userData = TestDataFactory.createUniqueUser(uniqueId);
    await test.step(`Register user: ${userData.userEmail}`, async () => {
      await userAPI.registerUser(userData);
    });
    await test.step(`Login with registered user: ${userData.userEmail}`, async () => {
      const loginResponse = await authAPI.login({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });
      expect(loginResponse.token).toBeTruthy();
      expect(loginResponse.userId).toBeTruthy();
    });
  });
});
