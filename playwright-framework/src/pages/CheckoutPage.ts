// EN: Import Playwright types and base page class
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
// EN: Import checkout-specific selectors
import { CheckoutLocators } from './locators';

/**
 * EN: Page Object for the Checkout page.
 *     Handles country selection, placing orders, and confirmation verification.
 *     ÙŠØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¯ÙˆÙ„Ø©ØŒ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨Ø§ØªØŒ ÙˆØ§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ØªØ£ÙƒÙŠØ¯.
 */
export class CheckoutPage extends BasePage {
  // EN: URL path for the checkout page | AR: Ù…Ø³Ø§Ø± URL Ù„ØµÙØ­Ø© Ø§Ù„Ø¯ÙØ¹
  readonly path = '#/dashboard/order';

  // EN: Locators for checkout page elements | AR: Ù…Ø­Ø¯Ø¯Ø§Øª Ø¹Ù†Ø§ØµØ± ØµÙØ­Ø© Ø§Ù„Ø¯ÙØ¹
  private readonly countryInput: Locator;
  private readonly countryOptions: Locator;
  private readonly placeOrderButton: Locator;
  private readonly emailLabel: Locator;
  private readonly orderConfirmationMessage: Locator;
  private readonly ordersLink: Locator;

  constructor(page: Page) {
    super(page);
    this.countryInput = page.locator(CheckoutLocators.countryInput);
    this.countryOptions = page.locator(CheckoutLocators.countryOptions);
    this.placeOrderButton = page.locator(CheckoutLocators.placeOrderButton);
    this.emailLabel = page.locator(CheckoutLocators.emailLabel);
    this.orderConfirmationMessage = page.locator(CheckoutLocators.orderConfirmationMessage);
    this.ordersLink = page.locator(CheckoutLocators.ordersLink);
  }

  // EN: Type a country prefix and select the first matching option
  async selectCountry(countryPrefix: string): Promise<void> {
    this.logger.info(`Selecting country starting with: ${countryPrefix}`);
    await this.countryInput.click();
    await this.countryInput.pressSequentially(countryPrefix, { delay: 50 });
    await this.countryOptions.first().waitFor({ state: 'visible' });
    await this.countryOptions.first().click();
  }

  // EN: Click place order and wait for confirmation message
  async placeOrder(): Promise<void> {
    this.logger.info('Placing order');
    await this.placeOrderButton.click();
    await this.orderConfirmationMessage.waitFor({ state: 'visible', timeout: 15000 });
  }

  // EN: Get the order confirmation message text
  async getConfirmationMessage(): Promise<string> {
    await this.orderConfirmationMessage.waitFor({ state: 'visible' });
    return (await this.orderConfirmationMessage.textContent()) ?? '';
  }

  // EN: Get the email address displayed on checkout
  async getEmail(): Promise<string> {
    return (await this.emailLabel.textContent()) ?? '';
  }

  // EN: Click the orders link after placing an order to view orders
  async clickOrdersLink(): Promise<void> {
    await this.ordersLink.click();
    await this.page.waitForURL('**/myorders');
  }

  // EN: Extract the order ID from the confirmation page
  async getOrderId(): Promise<string> {
    const rows = this.page.locator(CheckoutLocators.orderIdRows);
    await rows.first().waitFor({ state: 'visible' });
    return (await rows.first().textContent())?.trim() ?? '';
  }
}
