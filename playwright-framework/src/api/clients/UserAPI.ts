// EN: Import Playwright's API request context
import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../../core/base/BaseAPI';
import { CreateUserRequest, UserResponse } from '../models/UserModels';
import { RegisterResponse } from '../models/AuthModels';

/**
 * EN: API client for user management endpoints.
 */
export class UserAPI extends BaseAPI {
  constructor(request: APIRequestContext) {
    super(request);
  }

  // EN: Register a new user via the auth/register endpoint
  async registerUser(data: CreateUserRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/api/ecom/auth/register', data);
  }

  // EN: Get user details by userId (requires auth token in header)
  async getUserDetails(userId: string, token: string): Promise<UserResponse> {
    this.logger.info(`GET (auth) /api/ecom/user/${userId}`);
    const response = await this.request.get(`/api/ecom/user/${userId}`, {
      headers: { Authorization: token },
    });
    const body = await response.text();
    if (!response.ok()) {
      this.logger.error(`API Error [${response.status()}]: ${body}`);
      throw new Error(`API request failed with status ${response.status()}: ${body}`);
    }
    return JSON.parse(body) as UserResponse;
  }
}
