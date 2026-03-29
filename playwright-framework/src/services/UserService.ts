import { Page, APIRequestContext } from '@playwright/test';
import { OrdersPage } from '../pages/UserProfilePage';
import { UserAPI } from '../api/clients/UserAPI';
import { CreateUserRequest } from '../api/models/UserModels';
import { RegisterResponse } from '../api/models/AuthModels';
import { Logger } from '../core/logger/Logger';

/**
 * Service facade that combines UI and API user management flows.
 */
export class UserService {
  private readonly ordersPage: OrdersPage;
  private readonly userAPI: UserAPI;
  private readonly logger: Logger;

  constructor(page: Page, request: APIRequestContext) {
    this.ordersPage = new OrdersPage(page);
    this.userAPI = new UserAPI(request);
    this.logger = Logger.getInstance();
  }

  /** Register user via API */
  async registerUserViaAPI(data: CreateUserRequest): Promise<RegisterResponse> {
    this.logger.info(`[UserService] Registering user via API: ${data.userEmail}`);
    return this.userAPI.registerUser(data);
  }

  /** Navigate to orders page */
  async viewOrders(): Promise<void> {
    this.logger.info('[UserService] Viewing orders via UI');
    await this.ordersPage.navigate();
  }
}
