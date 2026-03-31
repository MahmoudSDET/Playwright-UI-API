// EN: Import Playwright's Page and Locator types
import { Page, Locator } from '@playwright/test';
// EN: Import the base page class with common methods
import { BasePage } from '../core/base/BasePage';
// EN: Import login page selectors from JSON
import { LoginLocators } from './locators';

/**
 * EN: Page Object for the Login page.
 *     Encapsulates all login-related interactions and selectors.
 *     ÙŠØºÙ„Ù ÙƒÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„Ø§Øª ÙˆØ§Ù„Ù…Ø­Ø¯Ø¯Ø§Øª Ø§Ù„Ù…ØªØ¹Ù„Ù‚Ø© Ø¨ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.
 */
export class LoginPage extends BasePage {
  // EN: URL path for the login page | AR: Ù…Ø³Ø§Ø± URL Ù„ØµÙØ­Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
  readonly path = '#/auth/login';

  // EN: Locators for login page elements | AR: Ù…Ø­Ø¯Ø¯Ø§Øª Ø¹Ù†Ø§ØµØ± ØµÙØ­Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorToast: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly registerLink: Locator;

  // EN: Initialize all locators from the LoginLocators JSON config
  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator(LoginLocators.emailInput);
    this.passwordInput = page.locator(LoginLocators.passwordInput);
    this.loginButton = page.locator(LoginLocators.loginButton);
    this.errorToast = page.locator(LoginLocators.errorToast);
    this.forgotPasswordLink = page.locator(LoginLocators.forgotPasswordLink);
    this.registerLink = page.locator(LoginLocators.registerLink);
  }

  // EN: Fill email and password fields then click login
  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in as ${email}`);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.loginButton.click();
  }

  // EN: Wait for the error toast and return its message text
  async getErrorMessage(): Promise<string> {
    await this.errorToast.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.errorToast.textContent()) ?? '';
  }

  // EN: Click the "Forgot Password" link
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  // EN: Click the "Register" link to navigate to registration page
  async clickRegister(): Promise<void> {
    await this.click(this.registerLink);
  }

  // EN: Check if the login button is visible on the page
  async isLoginButtonVisible(): Promise<boolean> {
    return this.isVisible(this.loginButton);
  }
}
