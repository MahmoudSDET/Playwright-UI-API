import { test, expect } from '../../src/fixtures/index';
import { credentials, products, checkout, messages } from '../../src/data/test-data';

test.describe('Order Workflow E2E (Hybrid)', () => {
  test.describe.configure({ mode: 'serial' });

  test('should complete full order workflow via UI', async ({
    loginPage,
    dashboardPage,
    cartPage,
    checkoutPage,
    ordersPage,
    page,
  }) => {
    // Step 1: Login
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash');

    // Step 2: Add product to cart
    await dashboardPage.addProductToCart(products.adidasOriginal);

    // Step 3: Go to cart
    await dashboardPage.goToCart();
    await page.waitForURL('**/cart');
    const isInCart = await cartPage.isProductInCart(products.adidasOriginal);
    expect(isInCart).toBeTruthy();

    // Step 4: Checkout
    await cartPage.checkout();

    // Step 5: Select country and place order
    await checkoutPage.selectCountry(checkout.countryPrefix);
    await checkoutPage.placeOrder();

    // Step 6: Verify order confirmation
    const confirmationMsg = await checkoutPage.getConfirmationMessage();
    expect(confirmationMsg.toLowerCase()).toContain(messages.orderConfirmation);

    // Step 7: Verify order appears in Orders page
    await checkoutPage.clickOrdersLink();
    await page.waitForURL('**/myorders');
    const orderCount = await ordersPage.getOrderCount();
    expect(orderCount).toBeGreaterThan(0);
  });

  test('should add multiple products and complete checkout', async ({
    loginPage,
    dashboardPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    // Login
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash');

    // Add multiple products
    await dashboardPage.addProductToCart(products.zaraCoat3);

    // Go to cart and checkout
    await dashboardPage.goToCart();
    await page.waitForURL('**/cart');
    await cartPage.checkout();

    // Place order
    await checkoutPage.selectCountry(checkout.countryPrefix);
    await checkoutPage.placeOrder();

    const confirmationMsg = await checkoutPage.getConfirmationMessage();
    expect(confirmationMsg.toLowerCase()).toContain(messages.orderConfirmation);
  });
});
