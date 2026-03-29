import { test, expect } from '../../src/fixtures/index';

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
    await loginPage.login('testpom2026@example.com', 'Test@12345');
    await page.waitForURL('**/dash');

    // Step 2: Add product to cart
    await dashboardPage.addProductToCart('ADIDAS ORIGINAL');

    // Step 3: Go to cart
    await dashboardPage.goToCart();
    await page.waitForURL('**/cart');
    const isInCart = await cartPage.isProductInCart('ADIDAS ORIGINAL');
    expect(isInCart).toBeTruthy();

    // Step 4: Checkout
    await cartPage.checkout();

    // Step 5: Select country and place order
    await checkoutPage.selectCountry('Ind');
    await checkoutPage.placeOrder();

    // Step 6: Verify order confirmation
    const confirmationMsg = await checkoutPage.getConfirmationMessage();
    expect(confirmationMsg.toLowerCase()).toContain('thankyou for the order');

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
    await loginPage.login('testpom2026@example.com', 'Test@12345');
    await page.waitForURL('**/dash');

    // Add multiple products
    await dashboardPage.addProductToCart('ZARA COAT 3');

    // Go to cart and checkout
    await dashboardPage.goToCart();
    await page.waitForURL('**/cart');
    await cartPage.checkout();

    // Place order
    await checkoutPage.selectCountry('Ind');
    await checkoutPage.placeOrder();

    const confirmationMsg = await checkoutPage.getConfirmationMessage();
    expect(confirmationMsg.toLowerCase()).toContain('thankyou for the order');
  });
});
