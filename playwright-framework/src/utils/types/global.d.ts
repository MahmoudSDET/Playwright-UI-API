// EN: Import the Environment type for type-safe env variable
import { Environment } from '../../core/config/EnvironmentConfig';

/**
 * EN: Global type augmentation for process.env with project-specific variables.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // EN: Current environment (local/staging/production) | AR: Ø§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©
      ENV: Environment;
      // EN: Base URL for UI tests | AR: Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª Ø§Ù„ÙˆØ§Ø¬Ù‡Ø©
      BASE_URL: string;
      // EN: Base URL for API tests | AR: Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª Ø§Ù„Ù€ API
      API_URL: string;
      TEST_USERNAME?: string;
      TEST_PASSWORD?: string;
      LOG_LEVEL?: string;
      // EN: CI flag (set by CI systems) | AR: Ø¹Ù„Ù… CI (ÙŠØ¹ÙŠÙ†Ù‡ Ù†Ø¸Ø§Ù… CI)
      CI?: string;
    }
  }
}

export {};
