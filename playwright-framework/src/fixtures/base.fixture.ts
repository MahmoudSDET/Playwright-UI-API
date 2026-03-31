// EN: Import Playwright's base test and page object / API client classes
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/UserProfilePage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AuthAPI } from '../api/clients/AuthAPI';
import { UserAPI } from '../api/clients/UserAPI';
import { OrderAPI } from '../api/clients/OrderAPI';

/**
 * EN: Type declarations for all core fixtures (page objects + API clients).
 */
export type CoreFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  ordersPage: OrdersPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authAPI: AuthAPI;
  userAPI: UserAPI;
  orderAPI: OrderAPI;
};

/**
 * EN: Base fixture that provides page objects and API clients to every test.
 *     Each fixture creates a new instance per test for isolation.
 *     ÙƒÙ„ fixture ÙŠÙ†Ø´Ø¦ Ù†Ø³Ø®Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù„ÙƒÙ„ Ø§Ø®ØªØ¨Ø§Ø± Ù„Ù„Ø¹Ø²Ù„.
 */
export const baseFixture = base.extend<CoreFixtures>({
  // EN: Login page object | AR: ÙƒØ§Ø¦Ù† ØµÙØ­Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // EN: Dashboard page object | AR: ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  // EN: Orders page object | AR: ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },

  // EN: Cart page object | AR: ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  // EN: Checkout page object | AR: ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ø§Ù„Ø¯ÙØ¹
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // EN: Auth API client | AR: Ø¹Ù…ÙŠÙ„ API Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø©
  authAPI: async ({ request }, use) => {
    await use(new AuthAPI(request));
  },

  // EN: User API client | AR: Ø¹Ù…ÙŠÙ„ API Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  userAPI: async ({ request }, use) => {
    await use(new UserAPI(request));
  },

  // EN: Order API client | AR: Ø¹Ù…ÙŠÙ„ API Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  orderAPI: async ({ request }, use) => {
    await use(new OrderAPI(request));
  },
});
