import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
import { DashboardLocators } from './locators';

export class DashboardPage extends BasePage {
  readonly path = '#/dashboard/dash';

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

  async getProductCount(): Promise<number> {
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.productCards.count();
  }

  async getProductNames(): Promise<string[]> {
    await this.productNames.first().waitFor({ state: 'visible' });
    return this.productNames.allTextContents();
  }

  private async waitForSpinner(): Promise<void> {
    await this.page.locator(DashboardLocators.spinner).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async addProductToCart(productName: string): Promise<void> {
    this.logger.info(`Adding ${productName} to cart`);
    await this.waitForSpinner();
    const card = this.productCards.filter({ hasText: productName });
    await card.locator(DashboardLocators.addToCartButton).click();
    await this.waitForSpinner();
  }

  async addFirstProductToCart(): Promise<void> {
    this.logger.info('Adding first product to cart');
    await this.addToCartButtons.first().click();
  }

  async viewProduct(productName: string): Promise<void> {
    this.logger.info(`Viewing product: ${productName}`);
    const card = this.productCards.filter({ hasText: productName });
    await card.locator(DashboardLocators.viewButton).click();
  }

  async searchProduct(keyword: string): Promise<void> {
    this.logger.info(`Searching for: ${keyword}`);
    await this.fill(this.searchInput, keyword);
  }

  async getCartCount(): Promise<string> {
    return (await this.cartBadge.textContent()) ?? '0';
  }

  async goToCart(): Promise<void> {
    this.logger.info('Navigating to cart');
    await this.waitForSpinner();
    await this.cartButton.click();
    await this.page.waitForURL('**/cart');
  }

  async goToOrders(): Promise<void> {
    this.logger.info('Navigating to orders');
    await this.waitForSpinner();
    await this.ordersButton.click();
    await this.page.waitForURL('**/myorders');
  }

  async signOut(): Promise<void> {
    this.logger.info('Signing out');
    await this.waitForSpinner();
    await this.signOutButton.click();
  }

  async isProductVisible(productName: string): Promise<boolean> {
    return this.productCards.filter({ hasText: productName }).isVisible();
  }
}
