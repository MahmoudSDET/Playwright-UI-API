// EN: Import Playwright's APIResponse type and Logger
import { APIResponse } from '@playwright/test';
import { Logger } from '../../core/logger/Logger';

/**
 * EN: Intercepts and processes API responses (logging, status classification, error extraction).
 */
export class ResponseInterceptor {
  private static logger = Logger.getInstance();

  // EN: Log the response status and URL | AR: ØªØ³Ø¬ÙŠÙ„ Ø­Ø§Ù„Ø© Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø© ÙˆØ§Ù„Ù€ URL
  static async logResponse(response: APIResponse): Promise<void> {
    const status = response.status();
    const url = response.url();
    const body = await response.text();
    ResponseInterceptor.logger.info(`Response: ${status} ${url}`);
    ResponseInterceptor.logger.info(`Response Body: ${body}`);
  }

  // EN: Check if response is successful (2xx) | AR: ÙØ­Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø© Ù†Ø§Ø¬Ø­Ø© (2xx)
  static isSuccess(response: APIResponse): boolean {
    return response.status() >= 200 && response.status() < 300;
  }

  // EN: Check if response is a client error (4xx) | AR: ÙØ­Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø© Ø®Ø·Ø£ Ø¹Ù…ÙŠÙ„ (4xx)
  static isClientError(response: APIResponse): boolean {
    return response.status() >= 400 && response.status() < 500;
  }

  // EN: Check if response is a server error (5xx) | AR: ÙØ­Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø© Ø®Ø·Ø£ Ø³ÙŠØ±ÙØ± (5xx)
  static isServerError(response: APIResponse): boolean {
    return response.status() >= 500;
  }

  // EN: Extract the error message from the response body
  static async extractErrorMessage(response: APIResponse): Promise<string> {
    try {
      const body = await response.json();
      return body.message || body.error || 'Unknown error';
    } catch {
      return `HTTP ${response.status()}: ${response.statusText()}`;
    }
  }
}
