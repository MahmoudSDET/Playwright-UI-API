import { IExecutionStrategy } from './IExecutionStrategy';

export class StagingStrategy implements IExecutionStrategy {
  async setup(): Promise<void> {
    // Staging-specific setup (e.g., reset test data via API)
  }

  async teardown(): Promise<void> {
    // Staging-specific teardown
  }

  getBaseURL(): string {
    return process.env.BASE_URL || 'https://rahulshettyacademy.com/client';
  }

  shouldRecordVideo(): boolean {
    return true;
  }

  getRetryCount(): number {
    return 1;
  }
}
