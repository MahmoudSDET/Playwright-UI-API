import crypto from 'crypto';

/**
 * String utility helpers for test data generation.
 */
export class StringHelper {
  static generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  static generateEmail(prefix = 'test'): string {
    return `${prefix}_${Date.now()}@example.com`;
  }

  static generateUsername(prefix = 'user'): string {
    return `${prefix}_${Date.now()}`;
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }
}
