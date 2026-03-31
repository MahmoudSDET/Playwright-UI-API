import { APIRequestContext } from '@playwright/test';
import { AuthAPI } from '../../api/clients/AuthAPI';
import { UserAPI } from '../../api/clients/UserAPI';
import { OrderAPI } from '../../api/clients/OrderAPI';

/**
 * EN: Factory pattern for creating API client instances from a request context.
 *     Centralizes API client creation for cleaner test setup.
 *     ÙŠØ±ÙƒØ² Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù…Ù„Ø§Ø¡ API Ù„Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ø®ØªØ¨Ø§Ø± Ø£Ù†Ø¸Ù.
 */
export class APIClientFactory {
  constructor(private readonly request: APIRequestContext) {}

  // EN: Create auth API client | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù…ÙŠÙ„ API Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø©
  createAuthAPI(): AuthAPI {
    return new AuthAPI(this.request);
  }

  // EN: Create user API client | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù…ÙŠÙ„ API Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  createUserAPI(): UserAPI {
    return new UserAPI(this.request);
  }

  // EN: Create order API client | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù…ÙŠÙ„ API Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  createOrderAPI(): OrderAPI {
    return new OrderAPI(this.request);
  }
}
