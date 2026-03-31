// EN: Import test fixtures and test data
import { test, expect } from '../../src/fixtures/index';
import { credentials, urls } from '../../src/data/test-data';

/**
 * EN: Orders (User Profile) Page UI Tests - validates orders display and navigation.
 */
test.describe('Orders Page Tests', () => {
  // EN: Login before each test | AR: ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù‚Ø¨Ù„ ÙƒÙ„ Ø§Ø®ØªØ¨Ø§Ø±
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash', { timeout: 15000 });
  });

  // EN: Verify navigation to orders page | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  test('should navigate to orders page', async ({ ordersPage, page }) => {
    await test.step('Navigate to orders page and verify URL', async () => {
      await ordersPage.navigate();
      await page.waitForURL('**/myorders');
      expect(page.url()).toContain(urls.orders);
    });
  });

  // EN: Verify orders table or no-orders message | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø£Ùˆ Ø±Ø³Ø§Ù„Ø© Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª
  test('should display orders table or no-orders message', async ({ ordersPage }) => {
    await test.step('Check orders table or no-orders message', async () => {
      await ordersPage.navigate();
      const orderCount = await ordersPage.getOrderCount();
      if (orderCount === 0) {
        expect(await ordersPage.hasNoOrders()).toBeTruthy();
      } else {
        expect(orderCount).toBeGreaterThan(0);
      }
    });
  });

  // EN: Verify navigation back to shop | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø±Ø¬ÙˆØ¹ Ø¥Ù„Ù‰ Ø§Ù„Ù…ØªØ¬Ø±
  test('should navigate back to shop', async ({ ordersPage, page }) => {
    await test.step('Go back to shop from orders page', async () => {
      await ordersPage.navigate();
      await ordersPage.goBackToShop();
      await page.waitForURL('**/dash');
      expect(page.url()).toContain(urls.dashboard);
    });
  });
});
