// EN: Import Playwright's API request context and response types
import { APIRequestContext, APIResponse } from '@playwright/test';
// EN: Import the centralized Logger for API call logging
import { Logger } from '../logger/Logger';

/**
 * EN: Abstract base class for all API clients.
 *     Provides common HTTP method wrappers with logging and error handling.
 *     ÙŠÙˆÙØ± Ø£ØºÙ„ÙØ© Ù„Ø¯ÙˆØ§Ù„ HTTP Ø§Ù„Ø´Ø§Ø¦Ø¹Ø© Ù…Ø¹ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙˆÙ…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø£Ø®Ø·Ø§Ø¡.
 */
export abstract class BaseAPI {
  // EN: Logger instance for recording API operations
  protected readonly logger: Logger;

  // EN: Constructor receives Playwright's API request context
  constructor(protected readonly request: APIRequestContext) {
    this.logger = Logger.getInstance();
  }

  // EN: Send a GET request and return parsed response
  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    this.logger.info(`GET ${endpoint}`);
    const response = await this.request.get(endpoint, { params });
    return this.handleResponse<T>(response);
  }

  // EN: Send a POST request with optional data payload
  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`POST ${endpoint}`);
    const response = await this.request.post(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  // EN: Send a PUT request with optional data payload
  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`PUT ${endpoint}`);
    const response = await this.request.put(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  // EN: Send a PATCH request with optional data payload
  protected async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`PATCH ${endpoint}`);
    const response = await this.request.patch(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  // EN: Send a DELETE request to the specified endpoint
  protected async delete<T>(endpoint: string): Promise<T> {
    this.logger.info(`DELETE ${endpoint}`);
    const response = await this.request.delete(endpoint);
    return this.handleResponse<T>(response);
  }

  // EN: Handle API response - parse JSON on success, throw error on failure
  private async handleResponse<T>(response: APIResponse): Promise<T> {
    const status = response.status();
    const body = await response.text();

    if (!response.ok()) {
      this.logger.error(`API Error [${status}]: ${body}`);
      throw new Error(`API request failed with status ${status}: ${body}`);
    }

    this.logger.info(`Response [${status}]`);
    return JSON.parse(body) as T;
  }

  // EN: Send a GET request and return the raw APIResponse without parsing
  protected async getRaw(endpoint: string, params?: Record<string, string>): Promise<APIResponse> {
    this.logger.info(`GET (raw) ${endpoint}`);
    return this.request.get(endpoint, { params });
  }
}
