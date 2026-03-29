import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';

export class CartPage extends BasePage {
  readonly path = '#/dashboard/cart';

  private readonly cartItems: Locator;
  private readonly cartItemTitles: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly cartHeading: Locator;
  private readonly totalPrice: Locator;
  private readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cartWrap .items');
    this.cartItemTitles = page.locator('.cartWrap .items h3');
    this.checkoutButton = page.getByRole('button', { name: /Checkout/ });
    this.continueShoppingButton = page.getByRole('button', { name: /Continue Shopping/ });
    this.cartHeading = page.locator('h1:has-text("My Cart")');
    this.totalPrice = page.locator('.totalRow .value').last();
    this.deleteButtons = page.locator('.btn-danger');
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartItemTitles.allTextContents();
  }

  async isProductInCart(productName: string): Promise<boolean> {
    await this.cartItems.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return this.cartItems.filter({ hasText: productName }).isVisible();
  }

  async removeProduct(productName: string): Promise<void> {
    this.logger.info(`Removing ${productName} from cart`);
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('.btn-danger').click();
  }

  async checkout(): Promise<void> {
    this.logger.info('Proceeding to checkout');
    await this.checkoutButton.click();
    await this.page.waitForURL('**/order**');
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) ?? '';
  }

  async isCartHeadingVisible(): Promise<boolean> {
    return this.isVisible(this.cartHeading);
  }
}
