import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';

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
    this.productCards = page.locator('.card');
    this.productNames = page.locator('.card-body h5 b');
    this.productPrices = page.locator('.card-body .text-muted');
    this.addToCartButtons = page.locator('.btn.w-10');
    this.viewButtons = page.locator('.btn.w-40');
    this.searchInput = page.locator('input[placeholder="search"]');
    this.cartButton = page.locator('button[routerlink="/dashboard/cart"]');
    this.cartBadge = page.locator('button[routerlink="/dashboard/cart"] span');
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.ordersButton = page.locator('button[routerlink="/dashboard/myorders"]');
    this.homeButton = page.locator('button[routerlink="/dashboard/"]');
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
    await this.page.locator('.ngx-spinner-overlay').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async addProductToCart(productName: string): Promise<void> {
    this.logger.info(`Adding ${productName} to cart`);
    await this.waitForSpinner();
    const card = this.productCards.filter({ hasText: productName });
    await card.locator('.btn.w-10').click();
    await this.waitForSpinner();
  }

  async addFirstProductToCart(): Promise<void> {
    this.logger.info('Adding first product to cart');
    await this.addToCartButtons.first().click();
  }

  async viewProduct(productName: string): Promise<void> {
    this.logger.info(`Viewing product: ${productName}`);
    const card = this.productCards.filter({ hasText: productName });
    await card.locator('.btn.w-40').click();
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
