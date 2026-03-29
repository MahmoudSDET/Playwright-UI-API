import { EnvironmentConfig } from '../EnvironmentConfig';

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
