// EN: Import the EnvironmentConfig interface
import { EnvironmentConfig } from '../EnvironmentConfig';

/**
 * EN: Staging environment configuration.
 *     headless: true, 1 retry, 45s timeout, credentials from env variables.
 *     headless: trueØŒ Ø¥Ø¹Ø§Ø¯Ø© Ù…Ø­Ø§ÙˆÙ„Ø© ÙˆØ§Ø­Ø¯Ø©ØŒ Ù…Ù‡Ù„Ø© 45 Ø«Ø§Ù†ÙŠØ©ØŒ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø©.
 */
export const stagingConfig: EnvironmentConfig = {
  env: 'staging',
  baseURL: process.env.BASE_URL || 'https://rahulshettyacademy.com/client',
  apiURL: process.env.API_URL || 'https://rahulshettyacademy.com/api/ecom',
  timeout: 45_000,
  retries: 1,
  headless: true,
  credentials: {
    email: process.env.TEST_EMAIL || 'testpom2026@example.com',
    password: process.env.TEST_PASSWORD || 'Test@12345',
  },
};
