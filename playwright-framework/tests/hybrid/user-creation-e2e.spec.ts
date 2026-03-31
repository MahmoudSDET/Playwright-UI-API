// EN: Import test fixtures and test data
import { test, expect } from '../../src/fixtures/index';
import { credentials, products, messages, urls, registration } from '../../src/data/test-data';

/**
 * EN: User Registration E2E (Hybrid) - combines API registration with UI login/verification.
 *     Tests the full flow: register via API â†’ login via UI â†’ verify dashboard.
 *     ÙŠØ®ØªØ¨Ø± Ø§Ù„ØªØ¯ÙÙ‚ Ø§Ù„ÙƒØ§Ù…Ù„: Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø¹Ø¨Ø± API â†’ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¹Ø¨Ø± Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© â†’ ØªØ­Ù‚Ù‚ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ….
 */
test.describe('User Registration E2E (Hybrid)', () => {
  // EN: Register via API then login via UI | AR: Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø¹Ø¨Ø± API Ø«Ù… Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¹Ø¨Ø± Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©
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

  // EN: Verify product catalog after login | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙƒØªØ§Ù„ÙˆØ¬ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø¨Ø¹Ø¯ Ø§Ù„Ø¯Ø®ÙˆÙ„
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
