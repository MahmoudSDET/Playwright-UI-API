import { Environment } from '../../core/config/EnvironmentConfig';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: Environment;
      BASE_URL: string;
      API_URL: string;
      TEST_USERNAME?: string;
      TEST_PASSWORD?: string;
      LOG_LEVEL?: string;
      CI?: string;
    }
  }
}

export {};
