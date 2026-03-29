import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/data/factories/TestDataFactory';

test.describe('User Registration E2E (Hybrid)', () => {
  test('should register user via API and login via UI', async ({
    authAPI,
    loginPage,
    page,
  }) => {
    // Step 1: Register user via API
    const uniqueId = Date.now().toString();
    const response = await authAPI.register({
      firstName: 'E2E',
      lastName: 'User',
      userEmail: `e2euser_${uniqueId}@example.com`,
      userPassword: 'Test@12345',
      confirmPassword: 'Test@12345',
      userMobile: '1234567890',
      occupation: 'Student',
      gender: 'Male',
      required18: true,
    });
    expect(response.message).toContain('Registered');

    // Step 2: Login via UI with the registered user
    await loginPage.navigate();
    await loginPage.login(`e2euser_${uniqueId}@example.com`, 'Test@12345');

    // Step 3: Verify user is on dashboard
    await page.waitForURL('**/dash');
    expect(page.url()).toContain('#/dashboard/dash');
  });

  test('should verify product catalog after login', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    // Login
    await loginPage.navigate();
    await loginPage.login('testpom2026@example.com', 'Test@12345');
    await page.waitForURL('**/dash');

    // Verify products are displayed
    const productNames = await dashboardPage.getProductNames();
    expect(productNames.length).toBeGreaterThan(0);

    // Verify specific product exists
    const hasAdidas = await dashboardPage.isProductVisible('ADIDAS ORIGINAL');
    expect(hasAdidas).toBeTruthy();
  });
});
