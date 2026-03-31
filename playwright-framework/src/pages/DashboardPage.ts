// EN: Import Playwright types and base page class
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
// EN: Import dashboard-specific selectors
import { DashboardLocators } from './locators';

/**
 * EN: Page Object for the Dashboard/Products page.
 *     Handles product listing, search, cart operations, and navigation.
 *     ÙŠØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†ØªØ¬Ø§ØªØŒ Ø§Ù„Ø¨Ø­Ø«ØŒ Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø³Ù„Ø©ØŒ ÙˆØ§Ù„ØªÙ†Ù‚Ù„.
 */
export class DashboardPage extends BasePage {
  // EN: URL path for the dashboard
  readonly path = '#/dashboard/dash';

  // EN: Locators for all dashboard elements
  private readonly productCards: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;
  private readonly addToCartButtons: Locator;
  private readonly viewButtons: Locator;
  private readonly searchInput: Locator;
  private readonly cartButton: Locator;
  private readonly cartBadge: Locator;
  private readonly signOutButton: Locator;
  private readonly ordersButton: Locator;
  private readonly homeButton: Locator;

  // EN: Initialize all dashboard locators from config
  constructor(page: Page) {
    super(page);
    this.productCards = page.locator(DashboardLocators.productCards);
    this.productNames = page.locator(DashboardLocators.productNames);
    this.productPrices = page.locator(DashboardLocators.productPrices);
    this.addToCartButtons = page.locator(DashboardLocators.addToCartButton);
    this.viewButtons = page.locator(DashboardLocators.viewButton);
    this.searchInput = page.locator(DashboardLocators.searchInput);
    this.cartButton = page.locator(DashboardLocators.cartButton);
    this.cartBadge = page.locator(DashboardLocators.cartBadge);
    this.signOutButton = page.locator(DashboardLocators.signOutButton);
    this.ordersButton = page.locator(DashboardLocators.ordersButton);
    this.homeButton = page.locator(DashboardLocators.homeButton);
  }

  // EN: Get the count of visible product cards
  async getProductCount(): Promise<number> {
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.productCards.count();
  }

  // EN: Get all product names displayed on the dashboard
  async getProductNames(): Promise<string[]> {
    await this.productNames.first().waitFor({ state: 'visible' });
    return this.productNames.allTextContents();
  }

  // EN: Wait for the loading spinner to disappear
  private async waitForSpinner(): Promise<void> {
    await this.page.locator(DashboardLocators.spinner).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  // EN: Add a specific product to cart by its name
  async addProductToCart(productName: string): Promise<void> {
    this.logger.info(`Adding ${productName} to cart`);
    await this.waitForSpinner();
    const card = this.productCards.filter({ hasText: productName });
    await card.locator(DashboardLocators.addToCartButton).click();
    await this.waitForSpinner();
  }

  // EN: Add the first product on the page to cart
  async addFirstProductToCart(): Promise<void> {
    this.logger.info('Adding first product to cart');
    await this.addToCartButtons.first().click();
  }

  // EN: View product details by clicking on a product card
  async viewProduct(productName: string): Promise<void> {
    this.logger.info(`Viewing product: ${productName}`);
    const card = this.productCards.filter({ hasText: productName });
    await card.locator(DashboardLocators.viewButton).click();
  }

  // EN: Search for products using a keyword
  async searchProduct(keyword: string): Promise<void> {
    this.logger.info(`Searching for: ${keyword}`);
    await this.fill(this.searchInput, keyword);
  }

  // EN: Get the current cart item count from the badge
  async getCartCount(): Promise<string> {
    return (await this.cartBadge.textContent()) ?? '0';
  }

  // EN: Navigate to the cart page
  async goToCart(): Promise<void> {
    this.logger.info('Navigating to cart');
    await this.waitForSpinner();
    await this.cartButton.click();
    await this.page.waitForURL('**/cart');
  }

  // EN: Navigate to the orders page
  async goToOrders(): Promise<void> {
    this.logger.info('Navigating to orders');
    await this.waitForSpinner();
    await this.ordersButton.click();
    await this.page.waitForURL('**/myorders');
  }

  // EN: Sign out from the application
  async signOut(): Promise<void> {
    this.logger.info('Signing out');
    await this.waitForSpinner();
    await this.signOutButton.click();
  }

  // EN: Check if a product is visible on the dashboard
  async isProductVisible(productName: string): Promise<boolean> {
    return this.productCards.filter({ hasText: productName }).isVisible();
  }
}
