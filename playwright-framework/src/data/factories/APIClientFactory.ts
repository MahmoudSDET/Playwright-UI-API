import { APIRequestContext } from '@playwright/test';
import { AuthAPI } from '../../api/clients/AuthAPI';
import { UserAPI } from '../../api/clients/UserAPI';
import { OrderAPI } from '../../api/clients/OrderAPI';

/**
 * Factory pattern for creating API client instances.
 */
export class APIClientFactory {
  constructor(private readonly request: APIRequestContext) {}

  createAuthAPI(): AuthAPI {
    return new AuthAPI(this.request);
  }

  createUserAPI(): UserAPI {
    return new UserAPI(this.request);
  }

  createOrderAPI(): OrderAPI {
    return new OrderAPI(this.request);
  }
}
