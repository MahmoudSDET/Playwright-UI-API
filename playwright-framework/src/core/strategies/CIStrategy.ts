// EN: Import the strategy interface
import { IExecutionStrategy } from './IExecutionStrategy';

/**
 * EN: CI/CD pipeline strategy - video enabled, 2 retries for stability.
 */
export class CIStrategy implements IExecutionStrategy {
  // EN: CI-specific setup (e.g., pull latest Docker images)
  async setup(): Promise<void> {
  }

  // EN: CI-specific teardown (e.g., publish artifacts)
  async teardown(): Promise<void> {
  }

  getBaseURL(): string {
    return process.env.BASE_URL || 'https://rahulshettyacademy.com/client';
  }

  // EN: Always record video in CI for debugging failures
  shouldRecordVideo(): boolean {
    return true;
  }

  // EN: 2 retries in CI to handle flaky tests
  getRetryCount(): number {
    return 2;
  }
}
