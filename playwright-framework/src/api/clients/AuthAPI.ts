import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../../core/base/BaseAPI';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/AuthModels';

export class AuthAPI extends BaseAPI {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/api/ecom/auth/login', credentials);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/api/ecom/auth/register', data);
  }
}
