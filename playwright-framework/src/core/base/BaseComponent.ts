// EN: Import Playwright's Page and Locator types
import { Page, Locator } from '@playwright/test';
// EN: Import the centralized Logger
import { Logger } from '../logger/Logger';

/**
 * EN: Abstract base class for reusable UI components (navbars, modals, tables, etc.).
 */
export abstract class BaseComponent {
  // EN: Logger instance for recording component actions
  protected readonly logger: Logger;

  // EN: Constructor receives the page and root locator that wraps the component
  constructor(
    protected readonly page: Page,
    protected readonly root: Locator,
  ) {
    this.logger = Logger.getInstance();
  }

  // EN: Check if the component is currently visible
  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  // EN: Wait until the component becomes visible
  async waitForVisible(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  // EN: Wait until the component becomes hidden
  async waitForHidden(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }
}
