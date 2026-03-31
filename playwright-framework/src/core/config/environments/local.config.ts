// EN: Import the EnvironmentConfig interface
import { EnvironmentConfig } from '../EnvironmentConfig';

/**
 * EN: Local development environment configuration.
 *     headless: false (browser visible), no retries, 30s timeout.
 *     headless: false (Ø§Ù„Ù…ØªØµÙØ­ Ø¸Ø§Ù‡Ø±)ØŒ Ø¨Ø¯ÙˆÙ† Ø¥Ø¹Ø§Ø¯Ø© Ù…Ø­Ø§ÙˆÙ„Ø§ØªØŒ Ù…Ù‡Ù„Ø© 30 Ø«Ø§Ù†ÙŠØ©.
 */
export const localConfig: EnvironmentConfig = {
  env: 'local',
  baseURL: process.env.BASE_URL || 'https://rahulshettyacademy.com/client',
  apiURL: process.env.API_URL || 'https://rahulshettyacademy.com/api/ecom',
  timeout: 30_000,
  retries: 0,
  headless: false,
  credentials: {
    email: 'testpom2026@example.com',
    password: 'Test@12345',
  },
};
