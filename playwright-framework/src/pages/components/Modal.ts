// EN: Import Playwright types and base component class
import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';
// EN: Import toast notification selectors
import { ToastLocators } from '../locators';

/**
 * EN: Toast notification component.
 *     Provides methods to read toast messages and check success/error states.
 *     ÙŠÙˆÙØ± Ø¯ÙˆØ§Ù„ Ù„Ù‚Ø±Ø§Ø¡Ø© Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù€ Toast ÙˆÙØ­Øµ Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­/Ø§Ù„Ø®Ø·Ø£.
 */
export class Toast extends BaseComponent {
  // EN: Locator for the toast message text | AR: Ù…Ø­Ø¯Ø¯ Ù†Øµ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ù€ Toast
  private readonly message: Locator;

  constructor(page: Page) {
    const root = page.locator(ToastLocators.container);
    super(page, root);
    this.message = root.locator(ToastLocators.message);
  }

  // EN: Wait for the toast to appear and return its message text
  async getMessage(): Promise<string> {
    await this.message.first().waitFor({ state: 'visible' });
    return (await this.message.first().textContent()) ?? '';
  }

  // EN: Check if a success toast is visible | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ù†Ø¬Ø§Ø­ Ø¸Ø§Ù‡Ø±Ù‹Ø§
  async isSuccessVisible(): Promise<boolean> {
    return this.root.locator(ToastLocators.success).isVisible();
  }

  // EN: Check if an error toast is visible | AR: Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù…Ø§ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ø®Ø·Ø£ Ø¸Ø§Ù‡Ø±Ù‹Ø§
  async isErrorVisible(): Promise<boolean> {
    return this.root.locator(ToastLocators.error).isVisible();
  }

  // EN: Wait for any toast message to appear
  async waitForToast(): Promise<void> {
    await this.message.first().waitFor({ state: 'visible' });
  }
}
