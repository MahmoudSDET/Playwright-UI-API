// EN: Import the EnvironmentConfig interface
import { EnvironmentConfig } from '../EnvironmentConfig';

/**
 * EN: Production environment configuration.
 *     headless: true, 2 retries, 60s timeout, credentials from env variables.
 *     headless: trueØŒ Ø¥Ø¹Ø§Ø¯ØªÙŠ Ù…Ø­Ø§ÙˆÙ„Ø©ØŒ Ù…Ù‡Ù„Ø© 60 Ø«Ø§Ù†ÙŠØ©ØŒ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø©.
 */
export const productionConfig: EnvironmentConfig = {
  env: 'production',
  baseURL: process.env.BASE_URL || 'https://rahulshettyacademy.com/client',
  apiURL: process.env.API_URL || 'https://rahulshettyacademy.com/api/ecom',
  timeout: 60_000,
  retries: 2,
  headless: true,
  credentials: {
    email: process.env.TEST_EMAIL || 'testpom2026@example.com',
    password: process.env.TEST_PASSWORD || 'Test@12345',
  },
};
