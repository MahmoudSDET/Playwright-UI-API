// EN: Import test fixtures and test data
import { test, expect } from '../../src/fixtures/index';
import { credentials, products, urls } from '../../src/data/test-data';

/**
 * EN: Dashboard Page UI Tests - validates product display, cart, orders, and sign out.
 *     Tests run in serial mode since they share browser state.
 *     Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª ØªØ¹Ù…Ù„ Ø¨Ø§Ù„ØªØªØ§Ø¨Ø¹ Ù„Ø£Ù†Ù‡Ø§ ØªØªØ´Ø§Ø±Ùƒ Ø­Ø§Ù„Ø© Ø§Ù„Ù…ØªØµÙØ­.
 */
test.describe('Dashboard Page Tests', () => {
  // EN: Run tests sequentially | AR: ØªØ´ØºÙŠÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª Ø¨Ø§Ù„ØªØªØ§Ø¨Ø¹
  test.describe.configure({ mode: 'serial' });

  // EN: Login before each test | AR: ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù‚Ø¨Ù„ ÙƒÙ„ Ø§Ø®ØªØ¨Ø§Ø±
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash', { timeout: 20000 });
    // EN: Wait for products to load and spinner to disappear
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  });

  // EN: Verify products are displayed | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
  test('should display products on dashboard', async ({ dashboardPage, softAssert }) => {
    await test.step('Check product count on dashboard', async () => {
      const count = await dashboardPage.getProductCount();
      softAssert.assertGreaterThan('Product count should be > 0', count, 0);
    });

    await test.step('Check product names are not empty', async () => {
      const names = await dashboardPage.getProductNames();
      softAssert.assertGreaterThan('Product names length should be > 0', names.length, 0);
      softAssert.assertTrue('First product name is not empty', names[0]?.trim().length > 0);
    });

    await softAssert.assertAll();
  });

  // EN: Verify product names are visible | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø¸Ù‡ÙˆØ± Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
  test('should display product names', async ({ dashboardPage }) => {
    await test.step('Get product names from dashboard', async () => {
      const names = await dashboardPage.getProductNames();
      expect(names.length).toBeGreaterThan(0);
    });
  });

  // EN: Add a product to the cart | AR: Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬ Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©
  test('should add product to cart', async ({ dashboardPage }) => {
    await test.step(`Add product "${products.adidasOriginal}" to cart`, async () => {
      await dashboardPage.addProductToCart(products.adidasOriginal);
    });
  });

  // EN: Navigate to cart page | AR: Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©
  test('should navigate to cart page', async ({ dashboardPage, page }) => {
    await test.step('Go to cart page from dashboard', async () => {
      await dashboardPage.goToCart();
      await page.waitForURL('**/cart');
      expect(page.url()).toContain(urls.cart);
    });
  });

  // EN: Navigate to orders page | AR: Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  test('should navigate to orders page', async ({ dashboardPage, page }) => {
    await test.step('Go to orders page from dashboard', async () => {
      await dashboardPage.goToOrders();
      await page.waitForURL('**/myorders');
      expect(page.url()).toContain(urls.orders);
    });
  });

  // EN: Sign out from the application | AR: ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ù…Ù† Ø§Ù„ØªØ·Ø¨ÙŠÙ‚
  test('should sign out successfully', async ({ dashboardPage, page }) => {
    await test.step('Sign out from dashboard', async () => {
      await dashboardPage.signOut();
      await page.waitForURL('**/auth/login');
      expect(page.url()).toContain(urls.login);
    });
  });
});
