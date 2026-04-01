// EN: Import Logger for token management logging
import { Logger } from '../../core/logger/Logger';

/**
 * EN: Manages authentication tokens for parallel test execution.
 *     Supports two strategies:
 *     1. Worker-scoped tokens: Each parallel worker gets its own isolated token (keyed by worker index).
 *     2. Shared token: A single token shared across all workers (e.g., set once in globalSetup).
 *     يدير رموز المصادقة للتنفيذ المتوازي للاختبارات.
 */
export class TokenManager {
  // EN: Worker-scoped tokens keyed by worker index | AR: رموز مخصصة لكل عامل مفهرسة بمعرف العامل
  private static workerTokens: Map<number, string> = new Map();
  // EN: Shared token used as fallback for all workers | AR: رمز مشترك يُستخدم كاحتياطي لجميع العمال
  private static sharedToken: string | null = null;
  private static logger = Logger.getInstance();

  // ─── Worker-scoped token methods ───

  // EN: Set a token for a specific worker index | AR: تعيين رمز لعامل محدد
  static setWorkerToken(workerIndex: number, token: string): void {
    TokenManager.workerTokens.set(workerIndex, token);
    this.logger.info(`Token set for worker ${workerIndex}`);
  }

  // EN: Get the token for a specific worker index | AR: الحصول على رمز عامل محدد
  static getWorkerToken(workerIndex: number): string | null {
    return TokenManager.workerTokens.get(workerIndex) ?? null;
  }

  // EN: Clear the token for a specific worker index | AR: مسح رمز عامل محدد
  static clearWorkerToken(workerIndex: number): void {
    TokenManager.workerTokens.delete(workerIndex);
    this.logger.info(`Token cleared for worker ${workerIndex}`);
  }

  // ─── Shared token methods ───

  // EN: Set a shared token used across all workers | AR: تعيين رمز مشترك لجميع العمال
  static setSharedToken(token: string): void {
    TokenManager.sharedToken = token;
    this.logger.info('Shared token set');
  }

  // EN: Get the shared token | AR: الحصول على الرمز المشترك
  static getSharedToken(): string | null {
    return TokenManager.sharedToken;
  }

  // EN: Clear the shared token | AR: مسح الرمز المشترك
  static clearSharedToken(): void {
    TokenManager.sharedToken = null;
    this.logger.info('Shared token cleared');
  }

  // ─── Token resolution ───

  /**
   * EN: Resolve the effective token for a given worker.
   *     Priority: worker-scoped token > shared token > null.
   *     الأولوية: رمز العامل > الرمز المشترك > null.
   */
  static resolveToken(workerIndex?: number): string | null {
    if (workerIndex !== undefined) {
      const workerToken = TokenManager.workerTokens.get(workerIndex);
      if (workerToken) {
        return workerToken;
      }
    }
    return TokenManager.sharedToken;
  }

  // EN: Clear all tokens (worker + shared) | AR: مسح جميع الرموز
  static clearAll(): void {
    TokenManager.workerTokens.clear();
    TokenManager.sharedToken = null;
    this.logger.info('All tokens cleared');
  }
}
