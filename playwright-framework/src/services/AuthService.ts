// EN: Import Playwright types and project dependencies
import { Page, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AuthAPI } from '../api/clients/AuthAPI';
import { LoginResponse } from '../api/models/AuthModels';
import { Logger } from '../core/logger/Logger';

/**
 * EN: Service facade that combines UI and API authentication flows.
 *     Provides a single interface for logging in via browser or API.
 *     ØªÙˆÙØ± ÙˆØ§Ø¬Ù‡Ø© ÙˆØ§Ø­Ø¯Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¹Ø¨Ø± Ø§Ù„Ù…ØªØµÙØ­ Ø£Ùˆ Ø§Ù„Ù€ API.
 */
export class AuthService {
  // EN: Page object for UI login | AR: ÙƒØ§Ø¦Ù† Ø§Ù„ØµÙØ­Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¹Ø¨Ø± Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©
  private readonly loginPage: LoginPage;
  // EN: API client for auth endpoints | AR: Ø¹Ù…ÙŠÙ„ API Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø©
  private readonly authAPI: AuthAPI;
  private readonly logger: Logger;

  constructor(page: Page, request: APIRequestContext) {
    this.loginPage = new LoginPage(page);
    this.authAPI = new AuthAPI(request);
    this.logger = Logger.getInstance();
  }

  // EN: Login via UI - navigates to the login page and fills credentials
  async loginViaUI(email: string, password: string): Promise<void> {
    this.logger.info(`[AuthService] UI login as ${email}`);
    await this.loginPage.navigate();
    await this.loginPage.login(email, password);
  }

  // EN: Login via API - faster, typically used in test setup
  async loginViaAPI(email: string, password: string): Promise<LoginResponse> {
    this.logger.info(`[AuthService] API login as ${email}`);
    return this.authAPI.login({ userEmail: email, userPassword: password });
  }
}
