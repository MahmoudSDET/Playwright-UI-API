import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/data/factories/TestDataFactory';

test.describe('User API Tests', () => {
  test('should register a new user via API', async ({ userAPI }) => {
    const userData = TestDataFactory.createUniqueUser();
    await test.step(`Register user with email: ${userData.userEmail}`, async () => {
      const response = await userAPI.registerUser(userData);
      expect(response.message).toContain('Registered');
    });
  });

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
