import { Page } from '@playwright/test';

/**
 * EN: Custom wait utility helpers for handling async conditions in tests.
 */
export class WaitHelper {
  // EN: Wait until all network requests are complete | AR: Ø§Ù†ØªØ¸Ø± Ø­ØªÙ‰ Ø§ÙƒØªÙ…Ø§Ù„ ÙƒÙ„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø´Ø¨ÙƒØ©
  static async waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  // EN: Wait until the URL changes from the current one | AR: Ø§Ù†ØªØ¸Ø± Ø­ØªÙ‰ ÙŠØªØºÙŠØ± Ø§Ù„Ù€ URL Ø¹Ù† Ø§Ù„Ø­Ø§Ù„ÙŠ
  static async waitForUrlChange(page: Page, currentUrl: string, timeout = 10000): Promise<void> {
    await page.waitForURL((url) => url.toString() !== currentUrl, { timeout });
  }

  // EN: Wait for a specific API response matching a URL pattern | AR: Ø§Ù†ØªØ¸Ø± Ø§Ø³ØªØ¬Ø§Ø¨Ø© API Ù…Ø­Ø¯Ø¯Ø© ØªØ·Ø§Ø¨Ù‚ Ù†Ù…Ø· URL
  static async waitForResponse(page: Page, urlPattern: string | RegExp, timeout = 10000): Promise<void> {
    await page.waitForResponse(urlPattern, { timeout });
  }

  // EN: Simple delay (sleep) for the given milliseconds | AR: ØªØ£Ø®ÙŠØ± Ø¨Ø³ÙŠØ· (sleep) Ø¨Ø§Ù„Ù…Ù„ÙŠ Ø«Ø§Ù†ÙŠØ©
  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // EN: Retry an async action with configurable attempts and delay
  static async retryAction<T>(
    action: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await WaitHelper.delay(delayMs);
        }
      }
    }
    throw lastError;
  }
}
