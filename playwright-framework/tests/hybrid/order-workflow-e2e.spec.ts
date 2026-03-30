import { test, expect } from '../../src/fixtures/index';
import { credentials, products, checkout, messages } from '../../src/data/test-data';
import { BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { OrdersPage } from '../../src/pages/UserProfilePage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';

test.describe('Order Workflow E2E (Hybrid)', () => {
  test.describe.configure({ mode: 'serial' });

  let context: BrowserContext;
  let page: Page;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ordersPage: OrdersPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    ordersPage = new OrdersPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
  });

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

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

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
