import { test, expect } from '../../src/fixtures/index';
import { credentials, products, urls } from '../../src/data/test-data';

test.describe('Dashboard Page Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash', { timeout: 20000 });
    // Wait for products to load and spinner to disappear
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  test('should display products on dashboard', async ({ dashboardPage }) => {
    await test.step('Check product count on dashboard', async () => {
      const count = await dashboardPage.getProductCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('should display product names', async ({ dashboardPage }) => {
    await test.step('Get product names from dashboard', async () => {
      const names = await dashboardPage.getProductNames();
      expect(names.length).toBeGreaterThan(0);
    });
  });

  test('should add product to cart', async ({ dashboardPage }) => {
    await test.step(`Add product "${products.adidasOriginal}" to cart`, async () => {
      await dashboardPage.addProductToCart(products.adidasOriginal);
    });
  });

  test('should navigate to cart page', async ({ dashboardPage, page }) => {
    await test.step('Go to cart page from dashboard', async () => {
      await dashboardPage.goToCart();
      await page.waitForURL('**/cart');
      expect(page.url()).toContain(urls.cart);
    });
  });

  test('should navigate to orders page', async ({ dashboardPage, page }) => {
    await test.step('Go to orders page from dashboard', async () => {
      await dashboardPage.goToOrders();
      await page.waitForURL('**/myorders');
      expect(page.url()).toContain(urls.orders);
    });
  });

  test('should sign out successfully', async ({ dashboardPage, page }) => {
    await test.step('Sign out from dashboard', async () => {
      await dashboardPage.signOut();
      await page.waitForURL('**/auth/login');
      expect(page.url()).toContain(urls.login);
    });
  });
});
