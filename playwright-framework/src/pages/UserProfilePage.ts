import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
import { OrdersLocators } from './locators';

export class OrdersPage extends BasePage {
  readonly path = '#/dashboard/myorders';

  private readonly orderRows: Locator;
  private readonly orderIds: Locator;
  private readonly viewButtons: Locator;
  private readonly noOrdersText: Locator;
  private readonly goBackToShopButton: Locator;
  private readonly goBackToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.orderRows = page.locator(OrdersLocators.orderRows);
    this.orderIds = page.locator(OrdersLocators.orderIds);
    this.viewButtons = page.locator(OrdersLocators.viewButton);
    this.noOrdersText = page.locator(OrdersLocators.noOrdersText);
    this.goBackToShopButton = page.locator(OrdersLocators.goBackToShopButton);
    this.goBackToCartButton = page.locator(OrdersLocators.goBackToCartButton);
  }

  private async waitForContent(): Promise<void> {
    // Wait for either the orders table or the no-orders message to appear
    await Promise.race([
      this.orderRows.first().waitFor({ state: 'visible', timeout: 15000 }),
      this.noOrdersText.waitFor({ state: 'visible', timeout: 15000 }),
    ]).catch(() => {});
  }

  async getOrderCount(): Promise<number> {
    await this.waitForContent();
    return this.orderRows.count();
  }

  async getOrderIds(): Promise<string[]> {
    return this.orderIds.allTextContents();
  }

  async viewOrder(index: number): Promise<void> {
    this.logger.info(`Viewing order at index ${index}`);
    await this.viewButtons.nth(index).click();
  }

  async viewOrderById(orderId: string): Promise<void> {
    this.logger.info(`Viewing order: ${orderId}`);
    const row = this.orderRows.filter({ hasText: orderId });
    await row.locator(OrdersLocators.viewButton).click();
  }

  async hasNoOrders(): Promise<boolean> {
    await this.waitForContent();
    return this.noOrdersText.isVisible();
  }

  async goBackToShop(): Promise<void> {
    await this.click(this.goBackToShopButton);
  }

  async isOrderPresent(orderId: string): Promise<boolean> {
    return this.page.locator(`text=${orderId}`).isVisible();
  }
}
