// EN: Import Playwright's API request context
import { APIRequestContext } from '@playwright/test';
// EN: Import the base API class and auth data models
import { BaseAPI } from '../../core/base/BaseAPI';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/AuthModels';
import { RequestInterceptor } from '../interceptors/RequestInterceptor';

/**
 * EN: API client for authentication endpoints (login, register).
 */
export class AuthAPI extends BaseAPI {
  constructor(request: APIRequestContext) {
    super(request);
  }

  // EN: Login with credentials, store token in RequestInterceptor, and return response
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/api/ecom/auth/login', credentials);
    RequestInterceptor.setAuthToken(response.token);
    return response;
  }

  // EN: Register a new user account
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/api/ecom/auth/register', data);
  }
}
