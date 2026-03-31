// EN: Import Playwright types and Logger
import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../../core/logger/Logger';

/**
 * EN: Intercepts and modifies outgoing API requests (e.g., attach auth headers).
 *     Manages a static auth token used across all requests.
 *     ÙŠØ¯ÙŠØ± Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø© Ø«Ø§Ø¨Øª ÙŠØ³ØªØ®Ø¯Ù… ÙÙŠ ÙƒÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª.
 */
export class RequestInterceptor {
  // EN: Static auth token shared across requests | AR: Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø© Ø«Ø§Ø¨Øª Ù…Ø´ØªØ±Ùƒ Ø¨ÙŠÙ† Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  private static token: string | null = null;
  private static logger = Logger.getInstance();

  // EN: Set the auth token for subsequent requests | AR: ØªØ¹ÙŠÙŠÙ† Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ù„Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù„Ø§Ø­Ù‚Ø©
  static setAuthToken(token: string): void {
    RequestInterceptor.token = token;
  }

  // EN: Clear the auth token | AR: Ù…Ø³Ø­ Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø©
  static clearAuthToken(): void {
    RequestInterceptor.token = null;
  }

  // EN: Build request headers (always JSON, optionally with Bearer token)
  static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (RequestInterceptor.token) {
      headers['Authorization'] = RequestInterceptor.token;
    }

    RequestInterceptor.logger.debug('Request headers prepared');
    return headers;
  }
}
