import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';

export class NavigationBar extends BaseComponent {
  private readonly homeButton: Locator;
  private readonly ordersButton: Locator;
  private readonly cartButton: Locator;
  private readonly signOutButton: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page) {
    const root = page.locator('.navbar');
    super(page, root);
    this.homeButton = root.locator('button[routerlink="/dashboard/"]');
    this.ordersButton = root.locator('button[routerlink="/dashboard/myorders"]');
    this.cartButton = root.locator('button[routerlink="/dashboard/cart"]');
    this.signOutButton = root.locator('button:has-text("Sign Out")');
    this.cartBadge = root.locator('button[routerlink="/dashboard/cart"] label');
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
