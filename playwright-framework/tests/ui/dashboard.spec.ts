import { test, expect } from '../../src/fixtures/index';

test.describe('Dashboard Page Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login('testpom2026@example.com', 'Test@12345');
    await page.waitForURL('**/dash', { timeout: 20000 });
    // Wait for products to load and spinner to disappear
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('should display products on dashboard', async ({ dashboardPage }) => {
    const count = await dashboardPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product names', async ({ dashboardPage }) => {
    const names = await dashboardPage.getProductNames();
    expect(names.length).toBeGreaterThan(0);
  });

  test('should add product to cart', async ({ dashboardPage }) => {
    await dashboardPage.addProductToCart('ADIDAS ORIGINAL');
    // Cart badge should update
  });

  test('should navigate to cart page', async ({ dashboardPage, page }) => {
    await dashboardPage.goToCart();
    await page.waitForURL('**/cart');
    expect(page.url()).toContain('#/dashboard/cart');
  });

  test('should navigate to orders page', async ({ dashboardPage, page }) => {
    await dashboardPage.goToOrders();
    await page.waitForURL('**/myorders');
    expect(page.url()).toContain('#/dashboard/myorders');
  });

  test('should sign out successfully', async ({ dashboardPage, page }) => {
    await dashboardPage.signOut();
    await page.waitForURL('**/auth/login');
    expect(page.url()).toContain('#/auth/login');
  });
});
