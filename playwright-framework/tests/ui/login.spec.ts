import { test, expect } from '../../src/fixtures/index';

test.describe('Login Page Tests', () => {
  test('should display login form', async ({ loginPage }) => {
    await loginPage.navigate();
    expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login('testpom2026@example.com', 'Test@12345');
    await page.waitForURL('**/dash');
    expect(page.url()).toContain('#/dashboard/dash');
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('invalid@example.com', 'wrong_password');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Incorrect email or password');
  });
});
