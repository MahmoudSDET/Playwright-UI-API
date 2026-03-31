// EN: Import test fixtures, test data, and Playwright types
import { test, expect } from '../../src/fixtures/index';
import { credentials, products, checkout, messages } from '../../src/data/test-data';
import { BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { OrdersPage } from '../../src/pages/UserProfilePage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';

/**
 * EN: Order Workflow E2E (Hybrid) - end-to-end test combining UI interactions.
 *     Tests the full flow: login â†’ add to cart â†’ checkout â†’ verify order.
 *     Uses serial mode with shared browser context.
 *     ÙŠØ®ØªØ¨Ø± Ø§Ù„ØªØ¯ÙÙ‚ Ø§Ù„ÙƒØ§Ù…Ù„: Ø§Ù„Ø¯Ø®ÙˆÙ„ â†’ Ø¥Ø¶Ø§ÙØ© Ù„Ù„Ø³Ù„Ø© â†’ Ø§Ù„Ø¯ÙØ¹ â†’ ØªØ­Ù‚Ù‚ Ø§Ù„Ø·Ù„Ø¨.
 *     ÙŠØ³ØªØ®Ø¯Ù… Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„ØªØ³Ù„Ø³Ù„ÙŠ Ù…Ø¹ Ø³ÙŠØ§Ù‚ Ù…ØªØµÙØ­ Ù…Ø´ØªØ±Ùƒ.
 */
test.describe('Order Workflow E2E (Hybrid)', () => {
  test.describe.configure({ mode: 'serial' });

  // EN: Shared browser context and page objects | AR: Ø³ÙŠØ§Ù‚ Ù…ØªØµÙØ­ ÙˆÙƒØ§Ø¦Ù†Ø§Øª ØµÙØ­Ø§Øª Ù…Ø´ØªØ±ÙƒØ©
  let context: BrowserContext;
  let page: Page;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ordersPage: OrdersPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  // EN: Create shared context and page objects once | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø³ÙŠØ§Ù‚ ÙˆÙƒØ§Ø¦Ù†Ø§Øª Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„Ù…Ø´ØªØ±ÙƒØ© Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    ordersPage = new OrdersPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  // EN: Clear cookies and storage before each test for clean state
  test.beforeEach(async () => {
    await context.clearCookies();
    await loginPage.navigate();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  // EN: Cleanup: close page and context | AR: ØªÙ†Ø¸ÙŠÙ: Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„ØµÙØ­Ø© ÙˆØ§Ù„Ø³ÙŠØ§Ù‚
  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  // EN: Full order workflow: login â†’ add to cart â†’ checkout â†’ verify
  test('should complete full order workflow via UI', async () => {
    const userEmail = credentials.valid.email;

    await test.step(`Login with: ${userEmail}`, async () => {
      await loginPage.login(userEmail, credentials.valid.password);
      await page.waitForURL('**/dash');
    });

    await test.step(`Add product "${products.adidasOriginal}" to cart`, async () => {
      await dashboardPage.addProductToCart(products.adidasOriginal);
    });

    await test.step('Go to cart and verify product', async () => {
      await dashboardPage.goToCart();
      await page.waitForURL('**/cart');
      const isInCart = await cartPage.isProductInCart(products.adidasOriginal);
      expect(isInCart).toBeTruthy();
    });

    await test.step('Checkout and place order', async () => {
      await cartPage.checkout();
      await checkoutPage.selectCountry(checkout.countryPrefix);
      await checkoutPage.placeOrder();
    });

    await test.step('Verify order confirmation', async () => {
      const confirmationMsg = await checkoutPage.getConfirmationMessage();
      expect(confirmationMsg.toLowerCase()).toContain(messages.orderConfirmation);
    });

    await test.step('Verify order appears in Orders page', async () => {
      await checkoutPage.clickOrdersLink();
      await page.waitForURL('**/myorders');
      const orderCount = await ordersPage.getOrderCount();
      expect(orderCount).toBeGreaterThan(0);
    });
  });

  // EN: Multiple products checkout flow | AR: ØªØ¯ÙÙ‚ Ø§Ù„Ø¯ÙØ¹ Ù„Ø¹Ø¯Ø© Ù…Ù†ØªØ¬Ø§Øª
  test('should add multiple products and complete checkout', async () => {
    const userEmail = credentials.valid.email;

    await test.step(`Login with: ${userEmail}`, async () => {
      await loginPage.login(userEmail, credentials.valid.password);
      await page.waitForURL('**/dash');
    });

    await test.step(`Add product "${products.zaraCoat3}" to cart`, async () => {
      await dashboardPage.addProductToCart(products.zaraCoat3);
    });

    await test.step('Go to cart and checkout', async () => {
      await dashboardPage.goToCart();
      await page.waitForURL('**/cart');
      await cartPage.checkout();
    });

    await test.step('Place order and verify confirmation', async () => {
      await checkoutPage.selectCountry(checkout.countryPrefix);
      await checkoutPage.placeOrder();
      const confirmationMsg = await checkoutPage.getConfirmationMessage();
      expect(confirmationMsg.toLowerCase()).toContain(messages.orderConfirmation);
    });
  });
});
