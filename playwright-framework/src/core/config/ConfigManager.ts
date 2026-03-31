// EN: Import the environment config type and config objects for each environment
import { EnvironmentConfig, Environment } from './EnvironmentConfig';
import { localConfig } from './environments/local.config';
import { stagingConfig } from './environments/staging.config';
import { productionConfig } from './environments/production.config';

/**
 * EN: Singleton configuration manager that resolves environment-specific settings.
 *     Reads ENV variable to determine which config to load.
 *     ÙŠÙ‚Ø±Ø£ Ù…ØªØºÙŠØ± ENV Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ØªØ­Ù…ÙŠÙ„Ù‡Ø§.
 */
export class ConfigManager {
  // EN: Singleton instance | AR: Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„ÙˆØ­ÙŠØ¯Ø© (Singleton)
  private static instance: ConfigManager;
  // EN: The resolved environment configuration | AR: Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„Ù…Ø­Ù„ÙˆÙ„Ø©
  private config: EnvironmentConfig;

  // EN: Private constructor - loads config based on ENV variable (defaults to 'local')
  private constructor() {
    const env = (process.env.ENV || 'local') as Environment;
    this.config = ConfigManager.loadConfig(env);
  }

  // EN: Get or create the singleton instance
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // EN: Get the full environment config object
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  // EN: Get a specific config value by key (type-safe)
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  // EN: Load the config object for the specified environment
  private static loadConfig(env: Environment): EnvironmentConfig {
    // EN: Map of environment names to their config objects
    const configs: Record<Environment, EnvironmentConfig> = {
      local: localConfig,
      staging: stagingConfig,
      production: productionConfig,
    };

    const config = configs[env];
    if (!config) {
      throw new Error(`Unknown environment: ${env}`);
    }
    return config;
  }
}
