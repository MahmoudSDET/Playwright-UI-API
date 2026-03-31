// EN: Import Playwright types and base page class
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
// EN: Import orders-specific selectors
import { OrdersLocators } from './locators';

/**
 * EN: Page Object for the Orders/User Profile page.
 *     Handles order listing, viewing order details, and navigation.
 *     ÙŠØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø¹Ø±Ø¶ Ø§Ù„Ø·Ù„Ø¨Ø§ØªØŒ Ø¹Ø±Ø¶ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ØŒ ÙˆØ§Ù„ØªÙ†Ù‚Ù„.
 */
export class OrdersPage extends BasePage {
  // EN: URL path for the orders page | AR: Ù…Ø³Ø§Ø± URL Ù„ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  readonly path = '#/dashboard/myorders';

  // EN: Locators for orders page elements | AR: Ù…Ø­Ø¯Ø¯Ø§Øª Ø¹Ù†Ø§ØµØ± ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
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

  // EN: Wait for either orders table or "no orders" message to appear
  private async waitForContent(): Promise<void> {
    await Promise.race([
      this.orderRows.first().waitFor({ state: 'visible', timeout: 15000 }),
      this.noOrdersText.waitFor({ state: 'visible', timeout: 15000 }),
    ]).catch(() => {});
  }

  // EN: Get the total number of orders
  async getOrderCount(): Promise<number> {
    await this.waitForContent();
    return this.orderRows.count();
  }

  // EN: Get all order IDs as text array
  async getOrderIds(): Promise<string[]> {
    return this.orderIds.allTextContents();
  }

  // EN: View a specific order by its row index
  async viewOrder(index: number): Promise<void> {
    this.logger.info(`Viewing order at index ${index}`);
    await this.viewButtons.nth(index).click();
  }

  // EN: View a specific order by its order ID
  async viewOrderById(orderId: string): Promise<void> {
    this.logger.info(`Viewing order: ${orderId}`);
    const row = this.orderRows.filter({ hasText: orderId });
    await row.locator(OrdersLocators.viewButton).click();
  }

  // EN: Check if the "no orders" message is displayed
  async hasNoOrders(): Promise<boolean> {
    await this.waitForContent();
    return this.noOrdersText.isVisible();
  }

  // EN: Navigate back to the shop from orders page
  async goBackToShop(): Promise<void> {
    await this.click(this.goBackToShopButton);
  }

  // EN: Check if a specific order ID is present in the list
  async isOrderPresent(orderId: string): Promise<boolean> {
    return this.page.locator(`text=${orderId}`).isVisible();
  }
}
