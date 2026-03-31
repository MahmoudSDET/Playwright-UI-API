// EN: Type alias for supported environment names
export type Environment = 'local' | 'staging' | 'production';

/**
 * EN: Interface defining the configuration structure for each environment.
 */
export interface EnvironmentConfig {
  // EN: The environment name | AR: Ø§Ø³Ù… Ø§Ù„Ø¨ÙŠØ¦Ø©
  env: Environment;
  // EN: Base URL for the web application | AR: Ø§Ù„Ù€ URL Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù„ØªØ·Ø¨ÙŠÙ‚
  baseURL: string;
  // EN: Base URL for the API endpoints | AR: Ø§Ù„Ù€ URL Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ù€ API
  apiURL: string;
  // EN: Global timeout in milliseconds | AR: Ø§Ù„Ù…Ù‡Ù„Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ© Ø§Ù„Ø¹Ø§Ù…Ø© Ø¨Ø§Ù„Ù…Ù„ÙŠ Ø«Ø§Ù†ÙŠØ©
  timeout: number;
  // EN: Number of test retries on failure | AR: Ø¹Ø¯Ø¯ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø¹Ù†Ø¯ ÙØ´Ù„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
  retries: number;
  // EN: Whether to run browser in headless mode | AR: Ù‡Ù„ ÙŠØªÙ… ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…ØªØµÙØ­ Ø¨Ø¯ÙˆÙ† ÙˆØ§Ø¬Ù‡Ø©
  headless: boolean;
  // EN: Login credentials for the test user | AR: Ø¨ÙŠØ§Ù†Ø§Øª ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
  credentials: {
    email: string;
    password: string;
  };
}
