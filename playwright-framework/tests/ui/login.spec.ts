import { test, expect } from '../../src/fixtures/index';
import { credentials, messages, urls } from '../../src/data/test-data';

test.describe('Login Page Tests', () => {
  test('should display login form', async ({ loginPage }) => {
    await test.step('Navigate to login page and verify form', async () => {
      await loginPage.navigate();
      expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
    });
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
    const userEmail = credentials.valid.email;
    await test.step(`Login with valid email: ${userEmail}`, async () => {
      await loginPage.navigate();
      await loginPage.login(userEmail, credentials.valid.password);
      await page.waitForURL('**/dash');
      expect(page.url()).toContain(urls.dashboard);
    });
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    const userEmail = credentials.invalid.email;
    await test.step(`Login with invalid email: ${userEmail}`, async () => {
      await loginPage.navigate();
      await loginPage.login(userEmail, credentials.invalid.password);
      const errorMsg = await loginPage.getErrorMessage();
      expect(errorMsg).toContain(messages.invalidLogin);
    });
  });
});
