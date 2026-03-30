import { test, expect } from '../../src/fixtures/index';
import { credentials, messages, urls } from '../../src/data/test-data';

test.describe('Login Page Tests', () => {
  test('should display login form', async ({ loginPage }) => {
    await loginPage.navigate();
    expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(credentials.valid.email, credentials.valid.password);
    await page.waitForURL('**/dash');
    expect(page.url()).toContain(urls.dashboard);
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login(credentials.invalid.email, credentials.invalid.password);
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain(messages.invalidLogin);
  });
});
