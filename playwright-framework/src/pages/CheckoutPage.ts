import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';

export class CheckoutPage extends BasePage {
  readonly path = '#/dashboard/order';

  private readonly countryInput: Locator;
  private readonly countryOptions: Locator;
  private readonly placeOrderButton: Locator;
  private readonly emailLabel: Locator;
  private readonly orderConfirmationMessage: Locator;
  private readonly ordersLink: Locator;

  constructor(page: Page) {
    super(page);
    this.countryInput = page.locator('input[placeholder="Select Country"]');
    this.countryOptions = page.locator('.ta-results button');
    this.placeOrderButton = page.locator('.btnn');
    this.emailLabel = page.locator('.user__name .txt');
    this.orderConfirmationMessage = page.locator('.hero-primary');
    this.ordersLink = page.locator('label[routerlink="/dashboard/myorders"]');
  }

  async selectCountry(countryPrefix: string): Promise<void> {
    this.logger.info(`Selecting country starting with: ${countryPrefix}`);
    await this.countryInput.click();
    await this.countryInput.pressSequentially(countryPrefix, { delay: 50 });
    await this.countryOptions.first().waitFor({ state: 'visible' });
    await this.countryOptions.first().click();
  }

  async placeOrder(): Promise<void> {
    this.logger.info('Placing order');
    await this.placeOrderButton.click();
    await this.orderConfirmationMessage.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getConfirmationMessage(): Promise<string> {
    await this.orderConfirmationMessage.waitFor({ state: 'visible' });
    return (await this.orderConfirmationMessage.textContent()) ?? '';
  }

  async getEmail(): Promise<string> {
    return (await this.emailLabel.textContent()) ?? '';
  }

  async clickOrdersLink(): Promise<void> {
    await this.ordersLink.click();
    await this.page.waitForURL('**/myorders');
  }

  async getOrderId(): Promise<string> {
    const rows = this.page.locator('label.ng-star-inserted');
    await rows.first().waitFor({ state: 'visible' });
    return (await rows.first().textContent())?.trim() ?? '';
  }
}
