import { EnvironmentConfig } from '../EnvironmentConfig';

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
