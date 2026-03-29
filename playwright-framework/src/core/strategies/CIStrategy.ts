import { IExecutionStrategy } from './IExecutionStrategy';

export class CIStrategy implements IExecutionStrategy {
  async setup(): Promise<void> {
    // CI-specific setup (e.g., pull latest Docker images)
  }

  async teardown(): Promise<void> {
    // CI-specific teardown (e.g., publish artifacts)
  }

  getBaseURL(): string {
    return process.env.BASE_URL || 'https://rahulshettyacademy.com/client';
  }

  shouldRecordVideo(): boolean {
    return true;
  }

  getRetryCount(): number {
    return 2;
  }
}
