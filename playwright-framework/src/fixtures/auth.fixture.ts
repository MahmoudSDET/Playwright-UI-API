import { baseFixture } from './base.fixture';
import { ConfigManager } from '../core/config/ConfigManager';

export type AuthFixtures = {
  authenticatedPage: void;
};

export const authFixture = baseFixture.extend<AuthFixtures>({
  authenticatedPage: [
    async ({ loginPage }, use) => {
      const config = ConfigManager.getInstance().getConfig();
      await loginPage.navigate();
      await loginPage.login(config.credentials.email, config.credentials.password);
      await use();
    },
    { auto: false },
  ],
});
