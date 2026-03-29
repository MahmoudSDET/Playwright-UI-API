import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../../core/logger/Logger';

/**
 * Intercepts and modifies outgoing API requests (e.g., attach auth headers).
 */
export class RequestInterceptor {
  private static token: string | null = null;
  private static logger = Logger.getInstance();

  static setAuthToken(token: string): void {
    RequestInterceptor.token = token;
  }

  static clearAuthToken(): void {
    RequestInterceptor.token = null;
  }

  static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (RequestInterceptor.token) {
      headers['Authorization'] = `Bearer ${RequestInterceptor.token}`;
    }

    RequestInterceptor.logger.debug('Request headers prepared');
    return headers;
  }
}
