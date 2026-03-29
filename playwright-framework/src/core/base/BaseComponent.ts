import { Page, Locator } from '@playwright/test';
import { Logger } from '../logger/Logger';

/**
 * Abstract base class for reusable UI components (navbars, modals, tables, etc.).
 */
export abstract class BaseComponent {
  protected readonly logger: Logger;

  constructor(
    protected readonly page: Page,
    protected readonly root: Locator,
  ) {
    this.logger = Logger.getInstance();
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async waitForVisible(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async waitForHidden(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }
}
