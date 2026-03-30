import { test, expect } from '../../src/fixtures/index';
import { credentials, products, messages, urls, registration } from '../../src/data/test-data';

test.describe('User Registration E2E (Hybrid)', () => {
  test('should register user via API and login via UI', async ({
    authAPI,
    loginPage,
    page,
  }) => {
    // Step 1: Register user via API
    const uniqueId = Date.now().toString();
    const payload = registration.buildPayload(uniqueId);
    const response = await authAPI.register(payload);
    expect(response.message).toContain(messages.registered);

    // Step 2: Login via UI with the registered user
    await loginPage.navigate();
    await loginPage.login(payload.userEmail, payload.userPassword);

    // Step 3: Verify user is on dashboard
    await page.waitForURL('**/dash');
    expect(page.url()).toContain(urls.dashboard);
  });

  test('should verify product catalog after login', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    // Login
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash');

    // Verify products are displayed
    const productNames = await dashboardPage.getProductNames();
    expect(productNames.length).toBeGreaterThan(0);

    // Verify specific product exists
    const hasAdidas = await dashboardPage.isProductVisible(products.adidasOriginal);
    expect(hasAdidas).toBeTruthy();
  });
});
