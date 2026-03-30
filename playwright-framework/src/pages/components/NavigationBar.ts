import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';
import { NavigationBarLocators } from '../locators';

export class NavigationBar extends BaseComponent {
  private readonly homeButton: Locator;
  private readonly ordersButton: Locator;
  private readonly cartButton: Locator;
  private readonly signOutButton: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page) {
    const root = page.locator(NavigationBarLocators.root);
    super(page, root);
    this.homeButton = root.locator(NavigationBarLocators.homeButton);
    this.ordersButton = root.locator(NavigationBarLocators.ordersButton);
    this.cartButton = root.locator(NavigationBarLocators.cartButton);
    this.signOutButton = root.locator(NavigationBarLocators.signOutButton);
    this.cartBadge = root.locator(NavigationBarLocators.cartBadge);
  }

  async goHome(): Promise<void> {
    await this.homeButton.click();
  }

  async goToOrders(): Promise<void> {
    await this.ordersButton.click();
  }

  async goToCart(): Promise<void> {
    await this.cartButton.click();
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  async getCartCount(): Promise<number> {
    const text = await this.cartBadge.textContent();
    return parseInt(text?.trim() || '0', 10);
  }
}
