// EN: Import Playwright's API request context and response types
import { APIRequestContext, APIResponse } from '@playwright/test';
// EN: Import the centralized Logger for API call logging
import { Logger } from '../logger/Logger';
// EN: Import interceptors for request headers and response processing
import { RequestInterceptor } from '../../api/interceptors/RequestInterceptor';
import { ResponseInterceptor } from '../../api/interceptors/ResponseInterceptor';

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
    const response = await this.request.get(endpoint, {
      headers: RequestInterceptor.getHeaders(),
      params,
    });
    return this.handleResponse<T>(response);
  }

  // EN: Send a POST request with optional data payload
  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`POST ${endpoint}`);
    const response = await this.request.post(endpoint, {
      headers: RequestInterceptor.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response);
  }

  // EN: Send a PUT request with optional data payload
  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`PUT ${endpoint}`);
    const response = await this.request.put(endpoint, {
      headers: RequestInterceptor.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response);
  }

  // EN: Send a PATCH request with optional data payload
  protected async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`PATCH ${endpoint}`);
    const response = await this.request.patch(endpoint, {
      headers: RequestInterceptor.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response);
  }

  // EN: Send a DELETE request to the specified endpoint
  protected async delete<T>(endpoint: string): Promise<T> {
    this.logger.info(`DELETE ${endpoint}`);
    const response = await this.request.delete(endpoint, {
      headers: RequestInterceptor.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  // EN: Handle API response using ResponseInterceptor for logging and classification
  private async handleResponse<T>(response: APIResponse): Promise<T> {
    await ResponseInterceptor.logResponse(response);

    if (!ResponseInterceptor.isSuccess(response)) {
      const errorMessage = await ResponseInterceptor.extractErrorMessage(response);
      const status = response.status();

      if (ResponseInterceptor.isClientError(response)) {
        this.logger.error(`Client Error [${status}]: ${errorMessage}`);
      } else if (ResponseInterceptor.isServerError(response)) {
        this.logger.error(`Server Error [${status}]: ${errorMessage}`);
      }

      throw new Error(`API request failed with status ${status}: ${errorMessage}`);
    }

    const body = await response.text();
    return JSON.parse(body) as T;
  }

  // EN: Send a GET request and return the raw APIResponse without parsing
  protected async getRaw(endpoint: string, params?: Record<string, string>): Promise<APIResponse> {
    this.logger.info(`GET (raw) ${endpoint}`);
    return this.request.get(endpoint, {
      headers: RequestInterceptor.getHeaders(),
      params,
    });
  }
}
