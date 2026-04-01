// EN: Import Playwright types and Logger
import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../../core/logger/Logger';
import { TokenManager } from './TokenManager';

/**
 * EN: Intercepts and modifies outgoing API requests (e.g., attach auth headers).
 *     Supports both parallel execution (per-worker tokens) and shared token mode.
 */
export class RequestInterceptor {
  // EN: Legacy static token for backward compatibility
  private static token: string | null = null;
  private static logger = Logger.getInstance();

  // --- Legacy single-token methods (backward compatible) ---

  // EN: Set the auth token (legacy)
  static setAuthToken(token: string): void {
    RequestInterceptor.token = token;
  }

  // EN: Clear the auth token (legacy)
  static clearAuthToken(): void {
    RequestInterceptor.token = null;
  }

  // --- Worker-aware token methods ---

  // EN: Set auth token for a specific worker (parallel-safe)
  static setWorkerAuthToken(workerIndex: number, token: string): void {
    TokenManager.setWorkerToken(workerIndex, token);
  }

  // EN: Clear auth token for a specific worker
  static clearWorkerAuthToken(workerIndex: number): void {
    TokenManager.clearWorkerToken(workerIndex);
  }

  // EN: Set a shared token across all workers
  static setSharedAuthToken(token: string): void {
    TokenManager.setSharedToken(token);
  }

  // EN: Clear the shared token
  static clearSharedAuthToken(): void {
    TokenManager.clearSharedToken();
  }

  // --- Header builders ---

  // EN: Build request headers (legacy - uses single static token)
  static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (RequestInterceptor.token) {
      headers['Authorization'] = RequestInterceptor.token;
    }

    this.logger.debug('Request headers prepared');
    return headers;
  }

  /**
   * EN: Build request headers with worker-aware token resolution.
   *     Priority: worker token > shared token > legacy static token.
   */
  static getWorkerHeaders(workerIndex?: number): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // EN: Resolve token: worker-specific > shared > legacy
    const token = TokenManager.resolveToken(workerIndex) ?? RequestInterceptor.token;

    if (token) {
      headers['Authorization'] = token;
    }

    this.logger.debug(`Request headers prepared (worker: ${workerIndex ?? 'default'})`);
    return headers;
  }
}
