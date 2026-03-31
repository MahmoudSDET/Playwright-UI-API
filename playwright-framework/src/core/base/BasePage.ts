// EN: Import Playwright's Page and Locator types for browser interaction
import { Page, Locator } from '@playwright/test';
// EN: Import the centralized Logger singleton for logging operations
import { Logger } from '../logger/Logger';

/**
 * EN: Abstract base class for all page objects.
 *     Provides common page interaction methods and enforces a consistent interface.
 *     ÙŠÙˆÙØ± Ø¯ÙˆØ§Ù„ ØªÙØ§Ø¹Ù„ Ù…Ø´ØªØ±ÙƒØ© Ù…Ø¹ Ø§Ù„ØµÙØ­Ø© ÙˆÙŠÙØ±Ø¶ ÙˆØ§Ø¬Ù‡Ø© Ù…ÙˆØ­Ø¯Ø©.
 */
export abstract class BasePage {
  // EN: Logger instance for recording page actions
  protected readonly logger: Logger;

  // EN: Constructor receives the Playwright Page and initializes the logger
  constructor(protected readonly page: Page) {
    this.logger = Logger.getInstance();
  }

  // EN: Each page must define its unique URL path
  abstract readonly path: string;

  // EN: Navigate to the page's URL path and wait for it to load
  async navigate(): Promise<void> {
    this.logger.info(`Navigating to ${this.path}`);
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  // EN: Wait for the page DOM content to be fully loaded
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // EN: Get the page title
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  // EN: Get the current page URL
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // EN: Wait for an element to be visible then click it
  protected async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  // EN: Wait for an element to be visible, clear it, then fill with value
  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  // EN: Wait for an element to be visible then get its text content
  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  // EN: Check if an element is currently visible on the page
  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  // EN: Select an option from a dropdown element
  protected async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  // EN: Upload a file to a file input element
  protected async uploadFile(locator: Locator, filePath: string): Promise<void> {
    await locator.setInputFiles(filePath);
  }

  // EN: Take a full-page screenshot and save it to the reports folder
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }
}
