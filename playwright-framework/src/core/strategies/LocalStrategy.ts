// EN: Import the strategy interface
import { IExecutionStrategy } from './IExecutionStrategy';

/**
 * EN: Local development strategy - no video, no retries, minimal setup.
 */
export class LocalStrategy implements IExecutionStrategy {
  // EN: Local-specific setup (e.g., seed local DB)
  async setup(): Promise<void> {
  }

  // EN: Local-specific teardown
  async teardown(): Promise<void> {
  }

  // EN: Return the base URL (from env or default)
  getBaseURL(): string {
    return process.env.BASE_URL || 'https://rahulshettyacademy.com/client';
  }

  // EN: No video recording in local development
  shouldRecordVideo(): boolean {
    return false;
  }

  // EN: No retries locally for faster feedback
  getRetryCount(): number {
    return 0;
  }
}
