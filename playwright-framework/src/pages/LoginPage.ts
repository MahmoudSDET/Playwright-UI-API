import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';

export class LoginPage extends BasePage {
  readonly path = '#/auth/login';

  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorToast: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#userEmail');
    this.passwordInput = page.locator('#userPassword');
    this.loginButton = page.locator('#login');
    this.errorToast = page.locator('.toast-error .toast-message');
    this.forgotPasswordLink = page.locator('a[href*="password-new"]');
    this.registerLink = page.locator('a[href*="register"]');
  }

  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in as ${email}`);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorToast.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.errorToast.textContent()) ?? '';
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  async clickRegister(): Promise<void> {
    await this.click(this.registerLink);
  }

  async isLoginButtonVisible(): Promise<boolean> {
    return this.isVisible(this.loginButton);
  }
}
