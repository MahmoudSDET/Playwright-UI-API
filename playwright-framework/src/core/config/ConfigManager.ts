import { EnvironmentConfig, Environment } from './EnvironmentConfig';
import { localConfig } from './environments/local.config';
import { stagingConfig } from './environments/staging.config';
import { productionConfig } from './environments/production.config';

/**
 * Singleton configuration manager resolving environment-specific settings.
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: EnvironmentConfig;

  private constructor() {
    const env = (process.env.ENV || 'local') as Environment;
    this.config = ConfigManager.loadConfig(env);
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): EnvironmentConfig {
    return this.config;
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  private static loadConfig(env: Environment): EnvironmentConfig {
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
