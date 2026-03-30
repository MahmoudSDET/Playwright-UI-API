import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
import { LoginLocators } from './locators';

export class LoginPage extends BasePage {
  readonly path = '#/auth/login';

  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorToast: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator(LoginLocators.emailInput);
    this.passwordInput = page.locator(LoginLocators.passwordInput);
    this.loginButton = page.locator(LoginLocators.loginButton);
    this.errorToast = page.locator(LoginLocators.errorToast);
    this.forgotPasswordLink = page.locator(LoginLocators.forgotPasswordLink);
    this.registerLink = page.locator(LoginLocators.registerLink);
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
