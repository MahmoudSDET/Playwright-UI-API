// EN: Import Playwright's API request context
import { APIRequestContext } from '@playwright/test';
// EN: Import the base API class and auth data models
import { BaseAPI } from '../../core/base/BaseAPI';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/AuthModels';
import { RequestInterceptor } from '../interceptors/RequestInterceptor';

/**
 * EN: API client for authentication endpoints (login, register).
 *     Supports both legacy single-token and worker-scoped parallel token modes.
 */
export class AuthAPI extends BaseAPI {
  constructor(request: APIRequestContext, workerIndex?: number) {
    super(request, workerIndex);
  }

  // EN: Login with credentials, store token based on mode (worker or legacy), and return response
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/api/ecom/auth/login', credentials);

    if (this.workerIndex !== undefined) {
      // EN: Parallel mode: store token scoped to this worker
      RequestInterceptor.setWorkerAuthToken(this.workerIndex, response.token);
    } else {
      // EN: Legacy mode: store token globally
      RequestInterceptor.setAuthToken(response.token);
    }

    return response;
  }

  // EN: Login and store token as shared across all workers (for beforeAll setup)
  async loginShared(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/api/ecom/auth/login', credentials);
    RequestInterceptor.setSharedAuthToken(response.token);
    return response;
  }

  // EN: Register a new user account
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/api/ecom/auth/register', data);
  }
}
