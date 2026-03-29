import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/UserProfilePage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AuthAPI } from '../api/clients/AuthAPI';
import { UserAPI } from '../api/clients/UserAPI';
import { OrderAPI } from '../api/clients/OrderAPI';

/** Type declarations for all core fixtures */
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

export const baseFixture = base.extend<CoreFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  authAPI: async ({ request }, use) => {
    await use(new AuthAPI(request));
  },

  userAPI: async ({ request }, use) => {
    await use(new UserAPI(request));
  },

  orderAPI: async ({ request }, use) => {
    await use(new OrderAPI(request));
  },
});
