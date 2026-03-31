// EN: Import Playwright types and base page class
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
// EN: Import cart-specific selectors
import { CartLocators } from './locators';

/**
 * EN: Page Object for the Cart page.
 *     Handles cart item listing, removal, checkout, and price display.
 *     ÙŠØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø¹Ø±Ø¶ Ø¹Ù†Ø§ØµØ± Ø§Ù„Ø³Ù„Ø©ØŒ Ø§Ù„Ø­Ø°ÙØŒ Ø§Ù„Ø¯ÙØ¹ØŒ ÙˆØ¹Ø±Ø¶ Ø§Ù„Ø³Ø¹Ø±.
 */
export class CartPage extends BasePage {
  // EN: URL path for the cart page | AR: Ù…Ø³Ø§Ø± URL Ù„ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©
  readonly path = '#/dashboard/cart';

  // EN: Locators for cart page elements | AR: Ù…Ø­Ø¯Ø¯Ø§Øª Ø¹Ù†Ø§ØµØ± ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©
  private readonly cartItems: Locator;
  private readonly cartItemTitles: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly cartHeading: Locator;
  private readonly totalPrice: Locator;
  private readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator(CartLocators.cartItems);
    this.cartItemTitles = page.locator(CartLocators.cartItemTitles);
    this.checkoutButton = page.locator(CartLocators.checkoutButton);
    this.continueShoppingButton = page.locator(CartLocators.continueShoppingButton);
    this.cartHeading = page.locator(CartLocators.cartHeading);
    this.totalPrice = page.locator(CartLocators.totalPrice).last();
    this.deleteButtons = page.locator(CartLocators.deleteButton);
  }

  // EN: Get the number of items in the cart
  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  // EN: Get the names of all cart items
  async getCartItemNames(): Promise<string[]> {
    return this.cartItemTitles.allTextContents();
  }

  // EN: Check if a specific product exists in the cart
  async isProductInCart(productName: string): Promise<boolean> {
    await this.cartItems.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return this.cartItems.filter({ hasText: productName }).isVisible();
  }

  // EN: Remove a product from the cart by its name
  async removeProduct(productName: string): Promise<void> {
    this.logger.info(`Removing ${productName} from cart`);
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator(CartLocators.deleteButton).click();
  }

  // EN: Proceed to checkout from the cart
  async checkout(): Promise<void> {
    this.logger.info('Proceeding to checkout');
    await this.checkoutButton.click();
    await this.page.waitForURL('**/order**');
  }

  // EN: Click "Continue Shopping" to go back to products
  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  // EN: Get the total price displayed in the cart
  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) ?? '';
  }

  // EN: Check if the cart heading is visible
  async isCartHeadingVisible(): Promise<boolean> {
    return this.isVisible(this.cartHeading);
  }
}
