import { test, expect } from '../../src/fixtures/index';
import { credentials, products, messages, urls, registration } from '../../src/data/test-data';

test.describe('User Registration E2E (Hybrid)', () => {
  test('should register user via API and login via UI', async ({
    authAPI,
    loginPage,
    page,
  }) => {
    const uniqueId = Date.now().toString();
    const payload = registration.buildPayload(uniqueId);

    await test.step(`Register user via API: ${payload.userEmail}`, async () => {
      const response = await authAPI.register(payload);
      expect(response.message).toContain(messages.registered);
    });

    await test.step(`Login via UI with: ${payload.userEmail}`, async () => {
      await loginPage.navigate();
      await loginPage.login(payload.userEmail, payload.userPassword);
    });

    await test.step('Verify user is on dashboard', async () => {
      await page.waitForURL('**/dash');
      expect(page.url()).toContain(urls.dashboard);
    });
  });

  test('should verify product catalog after login', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    const userEmail = credentials.valid.email;

    await test.step(`Login with: ${userEmail}`, async () => {
      await loginPage.navigate();
      await loginPage.login(userEmail, credentials.valid.password);
      await page.waitForURL('**/dash');
    });

    await test.step('Verify products are displayed', async () => {
      const productNames = await dashboardPage.getProductNames();
      expect(productNames.length).toBeGreaterThan(0);
    });

    await test.step(`Verify product "${products.adidasOriginal}" exists`, async () => {
      const hasAdidas = await dashboardPage.isProductVisible(products.adidasOriginal);
      expect(hasAdidas).toBeTruthy();
    });
  });
});
