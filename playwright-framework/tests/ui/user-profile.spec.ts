import { test, expect } from '../../src/fixtures/index';
import { credentials, urls } from '../../src/data/test-data';

test.describe('Orders Page Tests', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash', { timeout: 15000 });
  });

  test('should navigate to orders page', async ({ ordersPage, page }) => {
    await ordersPage.navigate();
    await page.waitForURL('**/myorders');
    expect(page.url()).toContain(urls.orders);
  });

  test('should display orders table or no-orders message', async ({ ordersPage }) => {
    await ordersPage.navigate();
    const orderCount = await ordersPage.getOrderCount();
    if (orderCount === 0) {
      expect(await ordersPage.hasNoOrders()).toBeTruthy();
    } else {
      expect(orderCount).toBeGreaterThan(0);
    }
  });

  test('should navigate back to shop', async ({ ordersPage, page }) => {
    await ordersPage.navigate();
    await ordersPage.goBackToShop();
    await page.waitForURL('**/dash');
    expect(page.url()).toContain(urls.dashboard);
  });
});
