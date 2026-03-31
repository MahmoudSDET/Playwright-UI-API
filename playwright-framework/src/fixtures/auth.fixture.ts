// EN: Import base fixture and config manager
import { baseFixture } from './base.fixture';
import { ConfigManager } from '../core/config/ConfigManager';

/**
 * EN: Type for the auth fixture - provides a pre-authenticated page.
 */
export type AuthFixtures = {
  authenticatedPage: void;
};

/**
 * EN: Auth fixture that logs in via UI before test starts.
 *     Uses credentials from the environment config. Not auto-enabled.
 *     ÙŠØ³ØªØ®Ø¯Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ù…Ù† ØªÙƒÙˆÙŠÙ† Ø§Ù„Ø¨ÙŠØ¦Ø©. ØºÙŠØ± Ù…ÙØ¹Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§.
 */
export const authFixture = baseFixture.extend<AuthFixtures>({
  authenticatedPage: [
    async ({ loginPage }, use) => {
      // EN: Get credentials from environment config | AR: Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ù…Ù† ØªÙƒÙˆÙŠÙ† Ø§Ù„Ø¨ÙŠØ¦Ø©
      const config = ConfigManager.getInstance().getConfig();
      // EN: Navigate to login page and authenticate | AR: Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„ØµÙØ­Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙˆØ§Ù„Ù…ØµØ§Ø¯Ù‚Ø©
      await loginPage.navigate();
      await loginPage.login(config.credentials.email, config.credentials.password);
      await use();
    },
    // EN: Not auto-enabled; must be explicitly used | AR: ØºÙŠØ± Ù…ÙØ¹Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§Ø› ÙŠØ¬Ø¨ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡ ØµØ±Ø§Ø­Ø©
    { auto: false },
  ],
});
