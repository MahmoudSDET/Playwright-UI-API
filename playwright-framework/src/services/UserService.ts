// EN: Import Playwright types and project dependencies
import { Page, APIRequestContext } from '@playwright/test';
import { OrdersPage } from '../pages/UserProfilePage';
import { UserAPI } from '../api/clients/UserAPI';
import { CreateUserRequest } from '../api/models/UserModels';
import { RegisterResponse } from '../api/models/AuthModels';
import { Logger } from '../core/logger/Logger';

/**
 * EN: Service facade that combines UI and API user management flows.
 *     Provides a unified interface for user operations.
 *     ØªÙˆÙØ± ÙˆØ§Ø¬Ù‡Ø© Ù…ÙˆØ­Ø¯Ø© Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù….
 */
export class UserService {
  // EN: Page object for orders UI | AR: ÙƒØ§Ø¦Ù† Ø§Ù„ØµÙØ­Ø© Ù„ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  private readonly ordersPage: OrdersPage;
  // EN: API client for user endpoints | AR: Ø¹Ù…ÙŠÙ„ API Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  private readonly userAPI: UserAPI;
  private readonly logger: Logger;

  constructor(page: Page, request: APIRequestContext) {
    this.ordersPage = new OrdersPage(page);
    this.userAPI = new UserAPI(request);
    this.logger = Logger.getInstance();
  }

  // EN: Register a user through the API (faster than UI registration)
  async registerUserViaAPI(data: CreateUserRequest): Promise<RegisterResponse> {
    this.logger.info(`[UserService] Registering user via API: ${data.userEmail}`);
    return this.userAPI.registerUser(data);
  }

  // EN: Navigate to the orders page in the UI
  async viewOrders(): Promise<void> {
    this.logger.info('[UserService] Viewing orders via UI');
    await this.ordersPage.navigate();
  }
}
