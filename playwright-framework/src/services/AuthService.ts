import { Page, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AuthAPI } from '../api/clients/AuthAPI';
import { LoginResponse } from '../api/models/AuthModels';
import { Logger } from '../core/logger/Logger';

/**
 * Service facade that combines UI and API authentication flows.
 */
export class AuthService {
  private readonly loginPage: LoginPage;
  private readonly authAPI: AuthAPI;
  private readonly logger: Logger;

  constructor(page: Page, request: APIRequestContext) {
    this.loginPage = new LoginPage(page);
    this.authAPI = new AuthAPI(request);
    this.logger = Logger.getInstance();
  }

  /** Login via UI */
  async loginViaUI(email: string, password: string): Promise<void> {
    this.logger.info(`[AuthService] UI login as ${email}`);
    await this.loginPage.navigate();
    await this.loginPage.login(email, password);
  }

  /** Login via API (faster, for setup) */
  async loginViaAPI(email: string, password: string): Promise<LoginResponse> {
    this.logger.info(`[AuthService] API login as ${email}`);
    return this.authAPI.login({ userEmail: email, userPassword: password });
  }
}
