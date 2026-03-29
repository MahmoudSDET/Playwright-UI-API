import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../../core/base/BaseAPI';
import { CreateUserRequest, UserResponse } from '../models/UserModels';
import { RegisterResponse } from '../models/AuthModels';

export class UserAPI extends BaseAPI {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async registerUser(data: CreateUserRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/api/ecom/auth/register', data);
  }

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
