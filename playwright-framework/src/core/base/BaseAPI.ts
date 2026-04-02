// EN: Import Playwright's API request context, response types, and TestStepInfo (v1.51)
import { APIRequestContext, APIResponse, test, TestStepInfo } from '@playwright/test';
// EN: Import the centralized Logger for API call logging
import { Logger } from '../logger/Logger';
// EN: Import interceptors for request headers and response processing
import { RequestInterceptor } from '../../api/interceptors/RequestInterceptor';
import { ResponseInterceptor } from '../../api/interceptors/ResponseInterceptor';

/**
 * EN: Abstract base class for all API clients.
 *     Provides common HTTP method wrappers with logging and error handling.
 *     Supports worker-aware token resolution for parallel test execution.
 */
export abstract class BaseAPI {
  // EN: Logger instance for recording API operations
  protected readonly logger: Logger;
  // EN: Optional worker index for parallel-safe token resolution
  protected workerIndex?: number;

  // EN: Constructor receives Playwright's API request context and optional worker index
  constructor(protected readonly request: APIRequestContext, workerIndex?: number) {
    this.logger = Logger.getInstance();
    this.workerIndex = workerIndex;
  }

  // EN: Set worker index after construction (e.g., from fixture)
  setWorkerIndex(workerIndex: number): void {
    this.workerIndex = workerIndex;
  }

  // EN: Get headers with unified token resolution (worker → shared → legacy)
  private getRequestHeaders(): Record<string, string> {
    return RequestInterceptor.getWorkerHeaders(this.workerIndex);
  }

  // EN: Mask sensitive headers (Authorization) for safe Allure attachment
  private maskHeaders(headers: Record<string, string>): Record<string, string> {
    const masked = { ...headers };
    if (masked['Authorization']) {
      masked['Authorization'] = masked['Authorization'].substring(0, 20) + '...***';
    }
    return masked;
  }

  // EN: Attach request details directly to the step via TestStepInfo (v1.51)
  //     This associates attachments with the specific step in trace viewer/reports
  private async attachRequestToStep(step: TestStepInfo, method: string, endpoint: string, headers: Record<string, string>, data?: unknown): Promise<void> {
    const requestInfo = {
      method,
      endpoint,
      headers: this.maskHeaders(headers),
      ...(data !== undefined && { body: data }),
    };
    await step.attach('Request', {
      body: JSON.stringify(requestInfo, null, 2),
      contentType: 'application/json',
    });
  }

  // EN: Attach response details directly to the step via TestStepInfo (v1.51)
  private async attachResponseToStep(step: TestStepInfo, response: APIResponse): Promise<void> {
    const status = response.status();
    const url = response.url();
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    const responseInfo = { status, url, body };
    await step.attach('Response', {
      body: JSON.stringify(responseInfo, null, 2),
      contentType: 'application/json',
    });
  }

  // EN: Send a GET request and return parsed response
  // EN: Uses TestStepInfo (v1.51) to attach request/response details directly to the step
  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return test.step(`GET ${endpoint}`, async (step) => {
      this.logger.info(`GET ${endpoint}`);
      const headers = this.getRequestHeaders();
      await this.attachRequestToStep(step, 'GET', endpoint, headers);
      const response = await this.request.get(endpoint, { headers, params });
      await this.attachResponseToStep(step, response);
      return this.handleResponse<T>(response);
    });
  }

  // EN: Send a POST request with optional data payload
  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return test.step(`POST ${endpoint}`, async (step) => {
      this.logger.info(`POST ${endpoint}`);
      const headers = this.getRequestHeaders();
      await this.attachRequestToStep(step, 'POST', endpoint, headers, data);
      const response = await this.request.post(endpoint, { headers, data });
      await this.attachResponseToStep(step, response);
      return this.handleResponse<T>(response);
    });
  }

  // EN: Send a PUT request with optional data payload
  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return test.step(`PUT ${endpoint}`, async (step) => {
      this.logger.info(`PUT ${endpoint}`);
      const headers = this.getRequestHeaders();
      await this.attachRequestToStep(step, 'PUT', endpoint, headers, data);
      const response = await this.request.put(endpoint, { headers, data });
      await this.attachResponseToStep(step, response);
      return this.handleResponse<T>(response);
    });
  }

  // EN: Send a PATCH request with optional data payload
  protected async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return test.step(`PATCH ${endpoint}`, async (step) => {
      this.logger.info(`PATCH ${endpoint}`);
      const headers = this.getRequestHeaders();
      await this.attachRequestToStep(step, 'PATCH', endpoint, headers, data);
      const response = await this.request.patch(endpoint, { headers, data });
      await this.attachResponseToStep(step, response);
      return this.handleResponse<T>(response);
    });
  }

  // EN: Send a DELETE request to the specified endpoint
  protected async delete<T>(endpoint: string): Promise<T> {
    return test.step(`DELETE ${endpoint}`, async (step) => {
      this.logger.info(`DELETE ${endpoint}`);
      const headers = this.getRequestHeaders();
      await this.attachRequestToStep(step, 'DELETE', endpoint, headers);
      const response = await this.request.delete(endpoint, { headers });
      await this.attachResponseToStep(step, response);
      return this.handleResponse<T>(response);
    });
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
    return test.step(`GET (raw) ${endpoint}`, async (step) => {
      this.logger.info(`GET (raw) ${endpoint}`);
      const headers = this.getRequestHeaders();
      await this.attachRequestToStep(step, 'GET', endpoint, headers);
      const response = await this.request.get(endpoint, { headers, params });
      await this.attachResponseToStep(step, response);
      return response;
    });
  }
}
