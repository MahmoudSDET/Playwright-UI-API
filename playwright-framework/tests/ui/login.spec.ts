// EN: Import test fixtures and test data
import { test, expect } from '../../src/fixtures/index';
import { credentials, messages, urls } from '../../src/data/test-data';

/**
 * EN: Login Page UI Tests - validates login form display, valid login, and invalid login.
 */
test.describe('Login Page Tests', () => {
  // EN: Test that the login form is displayed | AR: Ø§Ø®ØªØ¨Ø§Ø± Ø£Ù† Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø¹Ø±ÙˆØ¶
  test('should display login form', async ({ loginPage }) => {
    await test.step('Navigate to login page and verify form', async () => {
      await loginPage.navigate();
      expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
    });
  });

  // EN: Test login with valid credentials | AR: Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø¨ÙŠØ§Ù†Ø§Øª ØµØ­ÙŠØ­Ø©
  test('should login with valid credentials', async ({ loginPage, page }) => {
    const userEmail = credentials.valid.email;
    await test.step(`Login with valid email: ${userEmail}`, async () => {
      await loginPage.navigate();
      await loginPage.login(userEmail, credentials.valid.password);
      await page.waitForURL('**/dash');
      expect(page.url()).toContain(urls.dashboard);
    });
  });

  // EN: Test login with invalid credentials shows error | AR: Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø¨ÙŠØ§Ù†Ø§Øª Ø®Ø§Ø·Ø¦Ø© ÙŠØ¸Ù‡Ø± Ø®Ø·Ø£
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
