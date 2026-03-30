import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';
import { ToastLocators } from '../locators';

export class Toast extends BaseComponent {
  private readonly message: Locator;

  constructor(page: Page) {
    const root = page.locator(ToastLocators.container);
    super(page, root);
    this.message = root.locator(ToastLocators.message);
  }

  async getMessage(): Promise<string> {
    await this.message.first().waitFor({ state: 'visible' });
    return (await this.message.first().textContent()) ?? '';
  }

  async isSuccessVisible(): Promise<boolean> {
    return this.root.locator(ToastLocators.success).isVisible();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.root.locator(ToastLocators.error).isVisible();
  }

  async waitForToast(): Promise<void> {
    await this.message.first().waitFor({ state: 'visible' });
  }
}
