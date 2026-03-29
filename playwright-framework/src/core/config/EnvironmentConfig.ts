export type Environment = 'local' | 'staging' | 'production';

export interface EnvironmentConfig {
  env: Environment;
  baseURL: string;
  apiURL: string;
  timeout: number;
  retries: number;
  headless: boolean;
  credentials: {
    email: string;
    password: string;
  };
}
