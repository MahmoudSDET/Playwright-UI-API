import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../logger/Logger';

/**
 * Abstract base class for all API clients.
 * Provides common HTTP method wrappers with logging and error handling.
 */
export abstract class BaseAPI {
  protected readonly logger: Logger;

  constructor(protected readonly request: APIRequestContext) {
    this.logger = Logger.getInstance();
  }

  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    this.logger.info(`GET ${endpoint}`);
    const response = await this.request.get(endpoint, { params });
    return this.handleResponse<T>(response);
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`POST ${endpoint}`);
    const response = await this.request.post(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`PUT ${endpoint}`);
    const response = await this.request.put(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  protected async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    this.logger.info(`PATCH ${endpoint}`);
    const response = await this.request.patch(endpoint, { data });
    return this.handleResponse<T>(response);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    this.logger.info(`DELETE ${endpoint}`);
    const response = await this.request.delete(endpoint);
    return this.handleResponse<T>(response);
  }

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

  protected async getRaw(endpoint: string, params?: Record<string, string>): Promise<APIResponse> {
    this.logger.info(`GET (raw) ${endpoint}`);
    return this.request.get(endpoint, { params });
  }
}
