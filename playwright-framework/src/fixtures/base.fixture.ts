// EN: Import Playwright's base test and API client classes
import { test as base } from '@playwright/test';
import type { LoginPage } from '../pages/LoginPage';
import type { DashboardPage } from '../pages/DashboardPage';
import type { OrdersPage } from '../pages/UserProfilePage';
import type { CartPage } from '../pages/CartPage';
import type { CheckoutPage } from '../pages/CheckoutPage';
import { AuthAPI } from '../api/clients/AuthAPI';
import { OrderAPI } from '../api/clients/OrderAPI';
import { PageFactory } from '../data/factories/PageFactory';

/**
 * EN: Type declarations for all core fixtures (page objects + API clients).
 */
export type CoreFixtures = {
  pageFactory: PageFactory;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  ordersPage: OrdersPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  authAPI: AuthAPI;
  orderAPI: OrderAPI;
};

/**
 * EN: Base fixture that provides page objects and API clients to every test.
 *     Uses PageFactory to centralize page object creation.
 */
export const baseFixture = base.extend<CoreFixtures>({
  // EN: PageFactory instance
  pageFactory: async ({ page }, use) => {
    await use(new PageFactory(page));
  },

  // EN: Login page object via PageFactory
  loginPage: async ({ pageFactory }, use) => {
    await use(pageFactory.createLoginPage());
  },

  // EN: Dashboard page object via PageFactory
  dashboardPage: async ({ pageFactory }, use) => {
    await use(pageFactory.createDashboardPage());
  },

  // EN: Orders page object via PageFactory
  ordersPage: async ({ pageFactory }, use) => {
    await use(pageFactory.createOrdersPage());
  },

  // EN: Cart page object via PageFactory
  cartPage: async ({ pageFactory }, use) => {
    await use(pageFactory.createCartPage());
  },

  // EN: Checkout page object via PageFactory
  checkoutPage: async ({ pageFactory }, use) => {
    await use(pageFactory.createCheckoutPage());
  },

  // EN: Auth API client
  authAPI: async ({ request }, use) => {
    await use(new AuthAPI(request));
  },

  // EN: Order API client
  orderAPI: async ({ request }, use) => {
    await use(new OrderAPI(request));
  },
});