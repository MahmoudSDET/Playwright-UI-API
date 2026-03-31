import { Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { OrdersPage } from '../../pages/UserProfilePage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

/**
 * EN: Factory pattern for creating page object instances from a single Page.
 *     Centralizes page object creation and avoids direct instantiation in tests.
 *     ÙŠØ±ÙƒØ² Ø¥Ù†Ø´Ø§Ø¡ ÙƒØ§Ø¦Ù†Ø§Øª Ø§Ù„ØµÙØ­Ø§Øª ÙˆÙŠØªØ¬Ù†Ø¨ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± ÙÙŠ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª.
 */
export class PageFactory {
  constructor(private readonly page: Page) {}

  // EN: Create login page instance | AR: Ø¥Ù†Ø´Ø§Ø¡ ÙƒØ§Ø¦Ù† ØµÙØ­Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
  createLoginPage(): LoginPage {
    return new LoginPage(this.page);
  }

  // EN: Create dashboard page instance | AR: Ø¥Ù†Ø´Ø§Ø¡ ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
  createDashboardPage(): DashboardPage {
    return new DashboardPage(this.page);
  }

  // EN: Create orders page instance | AR: Ø¥Ù†Ø´Ø§Ø¡ ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  createOrdersPage(): OrdersPage {
    return new OrdersPage(this.page);
  }

  // EN: Create cart page instance | AR: Ø¥Ù†Ø´Ø§Ø¡ ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©
  createCartPage(): CartPage {
    return new CartPage(this.page);
  }

  // EN: Create checkout page instance | AR: Ø¥Ù†Ø´Ø§Ø¡ ÙƒØ§Ø¦Ù† ØµÙØ­Ø© Ø§Ù„Ø¯ÙØ¹
  createCheckoutPage(): CheckoutPage {
    return new CheckoutPage(this.page);
  }
}
