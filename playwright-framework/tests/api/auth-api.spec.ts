import { test, expect } from '../../src/fixtures/index';

test.describe('Auth API Tests', () => {
  test('should login via API with valid credentials', async ({ authAPI }) => {
    const userEmail = 'testpom2026@example.com';
    await test.step(`Login with email: ${userEmail}`, async () => {
      const response = await authAPI.login({
        userEmail,
        userPassword: 'Test@12345',
      });
      expect(response.token).toBeTruthy();
      expect(response.userId).toBeTruthy();
    });
  });

  test('should fail login with invalid credentials', async ({ authAPI }) => {
    const userEmail = 'invalid@example.com';
    await test.step(`Login with email: ${userEmail}`, async () => {
      await expect(
        authAPI.login({ userEmail, userPassword: 'wrong' }),
      ).rejects.toThrow();
    });
  });

  test('should register a new user via API', async ({ authAPI }) => {
    const uniqueId = Date.now().toString();
    const userEmail = `testapi_${uniqueId}@example.com`;
    await test.step(`Register with email: ${userEmail}`, async () => {
      const response = await authAPI.register({
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
