/**
 * Strategy pattern interface for environment-specific execution behaviour.
 */
export interface IExecutionStrategy {
  setup(): Promise<void>;
  teardown(): Promise<void>;
  getBaseURL(): string;
  shouldRecordVideo(): boolean;
  getRetryCount(): number;
}
