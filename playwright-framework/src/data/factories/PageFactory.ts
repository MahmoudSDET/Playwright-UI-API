import { Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { OrdersPage } from '../../pages/UserProfilePage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

/**
 * Factory pattern for creating page object instances.
 */
export class PageFactory {
  constructor(private readonly page: Page) {}

  createLoginPage(): LoginPage {
    return new LoginPage(this.page);
  }

  createDashboardPage(): DashboardPage {
    return new DashboardPage(this.page);
  }

  createOrdersPage(): OrdersPage {
    return new OrdersPage(this.page);
  }

  createCartPage(): CartPage {
    return new CartPage(this.page);
  }

  createCheckoutPage(): CheckoutPage {
    return new CheckoutPage(this.page);
  }
}
