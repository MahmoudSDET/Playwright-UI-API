// EN: Import the strategy interface
import { IExecutionStrategy } from './IExecutionStrategy';

/**
 * EN: Staging environment strategy - video enabled, 1 retry.
 */
export class StagingStrategy implements IExecutionStrategy {
  // EN: Staging-specific setup (e.g., reset test data via API)
  async setup(): Promise<void> {
  }

  // EN: Staging-specific teardown
  async teardown(): Promise<void> {
  }

  getBaseURL(): string {
    return process.env.BASE_URL || 'https://rahulshettyacademy.com/client';
  }

  // EN: Record video on staging for debugging
  shouldRecordVideo(): boolean {
    return true;
  }

  // EN: Allow 1 retry on staging
  getRetryCount(): number {
    return 1;
  }
}
