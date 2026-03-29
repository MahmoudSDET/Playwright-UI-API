import { APIResponse } from '@playwright/test';
import { Logger } from '../../core/logger/Logger';

/**
 * Intercepts and processes API responses (e.g., logging, error mapping).
 */
export class ResponseInterceptor {
  private static logger = Logger.getInstance();

  static async logResponse(response: APIResponse): Promise<void> {
    const status = response.status();
    const url = response.url();
    ResponseInterceptor.logger.info(`Response: ${status} ${url}`);
  }

  static isSuccess(response: APIResponse): boolean {
    return response.status() >= 200 && response.status() < 300;
  }

  static isClientError(response: APIResponse): boolean {
    return response.status() >= 400 && response.status() < 500;
  }

  static isServerError(response: APIResponse): boolean {
    return response.status() >= 500;
  }

  static async extractErrorMessage(response: APIResponse): Promise<string> {
    try {
      const body = await response.json();
      return body.message || body.error || 'Unknown error';
    } catch {
      return `HTTP ${response.status()}: ${response.statusText()}`;
    }
  }
}
