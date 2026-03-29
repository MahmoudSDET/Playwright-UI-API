import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/data/factories/TestDataFactory';

test.describe('User API Tests', () => {
  test('should register a new user via API', async ({ userAPI }) => {
    const userData = TestDataFactory.createUniqueUser();
    const response = await userAPI.registerUser(userData);
    expect(response.message).toContain('Registered');
  });

  test('should login with newly registered user', async ({ userAPI, authAPI }) => {
    const uniqueId = Date.now().toString();
    const userData = TestDataFactory.createUniqueUser(uniqueId);
    await userAPI.registerUser(userData);

    const loginResponse = await authAPI.login({
      userEmail: userData.userEmail,
      userPassword: userData.userPassword,
    });
    expect(loginResponse.token).toBeTruthy();
    expect(loginResponse.userId).toBeTruthy();
  });
});
