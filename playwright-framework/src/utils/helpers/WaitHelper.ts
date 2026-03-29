import { Page } from '@playwright/test';

/**
 * Wait utility helpers for custom wait conditions.
 */
export class WaitHelper {
  static async waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async waitForUrlChange(page: Page, currentUrl: string, timeout = 10000): Promise<void> {
    await page.waitForURL((url) => url.toString() !== currentUrl, { timeout });
  }

  static async waitForResponse(page: Page, urlPattern: string | RegExp, timeout = 10000): Promise<void> {
    await page.waitForResponse(urlPattern, { timeout });
  }

  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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
