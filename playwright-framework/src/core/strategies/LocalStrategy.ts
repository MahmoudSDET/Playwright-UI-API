import { IExecutionStrategy } from './IExecutionStrategy';

export class LocalStrategy implements IExecutionStrategy {
  async setup(): Promise<void> {
    // Local-specific setup (e.g., seed local DB)
  }

  async teardown(): Promise<void> {
    // Local-specific teardown
  }

  getBaseURL(): string {
    return process.env.BASE_URL || 'https://rahulshettyacademy.com/client';
  }

  shouldRecordVideo(): boolean {
    return false;
  }

  getRetryCount(): number {
    return 0;
  }
}
