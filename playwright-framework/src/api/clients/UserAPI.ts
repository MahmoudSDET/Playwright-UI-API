// EN: Import Playwright's API request context
import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../../core/base/BaseAPI';
import { CreateUserRequest, UserResponse } from '../models/UserModels';
import { RegisterResponse } from '../models/AuthModels';

/**
 * EN: API client for user management endpoints.
 *     Uses RequestInterceptor for auth headers on protected routes.
 *     Supports worker-scoped tokens for parallel execution.
 */
export class UserAPI extends BaseAPI {
  constructor(request: APIRequestContext, workerIndex?: number) {
    super(request, workerIndex);
  }

  // EN: Register a new user via the auth/register endpoint
  async registerUser(data: CreateUserRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/api/ecom/auth/register', data);
  }

  // EN: Get user details by userId (requires prior login via AuthAPI)
  async getUserDetails(userId: string): Promise<UserResponse> {
    return this.get<UserResponse>(`/api/ecom/user/${userId}`);
  }
}
