// EN: Import Playwright types and base component class
import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';
// EN: Import navigation bar selectors
import { NavigationBarLocators } from '../locators';

/**
 * EN: Reusable Navigation Bar component.
 *     Provides methods to navigate between pages and check cart count.
 *     ÙŠÙˆÙØ± Ø¯ÙˆØ§Ù„ Ù„Ù„ØªÙ†Ù‚Ù„ Ø¨ÙŠÙ† Ø§Ù„ØµÙØ­Ø§Øª ÙˆÙØ­Øµ Ø¹Ø¯Ø¯ Ø¹Ù†Ø§ØµØ± Ø§Ù„Ø³Ù„Ø©.
 */
export class NavigationBar extends BaseComponent {
  // EN: Locators for nav bar buttons | AR: Ù…Ø­Ø¯Ø¯Ø§Øª Ø£Ø²Ø±Ø§Ø± Ø´Ø±ÙŠØ· Ø§Ù„ØªÙ†Ù‚Ù„
  private readonly homeButton: Locator;
  private readonly ordersButton: Locator;
  private readonly cartButton: Locator;
  private readonly signOutButton: Locator;
  private readonly cartBadge: Locator;

  // EN: Initialize nav bar with root locator and child elements
  constructor(page: Page) {
    const root = page.locator(NavigationBarLocators.root);
    super(page, root);
    this.homeButton = root.locator(NavigationBarLocators.homeButton);
    this.ordersButton = root.locator(NavigationBarLocators.ordersButton);
    this.cartButton = root.locator(NavigationBarLocators.cartButton);
    this.signOutButton = root.locator(NavigationBarLocators.signOutButton);
    this.cartBadge = root.locator(NavigationBarLocators.cartBadge);
  }

  // EN: Navigate to the home page | AR: Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
  async goHome(): Promise<void> {
    await this.homeButton.click();
  }

  // EN: Navigate to the orders page | AR: Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  async goToOrders(): Promise<void> {
    await this.ordersButton.click();
  }

  // EN: Navigate to the cart page | AR: Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø© Ø§Ù„Ø³Ù„Ø©
  async goToCart(): Promise<void> {
    await this.cartButton.click();
  }

  // EN: Sign out from the application | AR: ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ù…Ù† Ø§Ù„ØªØ·Ø¨ÙŠÙ‚
  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  // EN: Get the number of items in the cart from the badge
  async getCartCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return parseInt(text?.trim() || '0', 10);
  }
}
