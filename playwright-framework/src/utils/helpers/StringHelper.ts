import crypto from 'crypto';

/**
 * EN: String utility helpers for generating random test data.
 */
export class StringHelper {
  // EN: Generate a random hex string of the given length | AR: ØªÙˆÙ„ÙŠØ¯ Ù†Øµ hex Ø¹Ø´ÙˆØ§Ø¦ÙŠ Ø¨Ø§Ù„Ø·ÙˆÙ„ Ø§Ù„Ù…Ø­Ø¯Ø¯
  static generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  // EN: Generate a unique email with timestamp | AR: ØªÙˆÙ„ÙŠØ¯ Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙØ±ÙŠØ¯ Ø¨Ø§Ù„Ø·Ø§Ø¨Ø¹ Ø§Ù„Ø²Ù…Ù†ÙŠ
  static generateEmail(prefix = 'test'): string {
    return `${prefix}_${Date.now()}@example.com`;
  }

  // EN: Generate a unique username with timestamp | AR: ØªÙˆÙ„ÙŠØ¯ Ø§Ø³Ù… Ù…Ø³ØªØ®Ø¯Ù… ÙØ±ÙŠØ¯ Ø¨Ø§Ù„Ø·Ø§Ø¨Ø¹ Ø§Ù„Ø²Ù…Ù†ÙŠ
  static generateUsername(prefix = 'user'): string {
    return `${prefix}_${Date.now()}`;
  }

  // EN: Capitalize the first letter of a string | AR: ØªÙƒØ¨ÙŠØ± Ø§Ù„Ø­Ø±Ù Ø§Ù„Ø£ÙˆÙ„ Ù…Ù† Ø§Ù„Ù†Øµ
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // EN: Truncate a string to maxLength, adding "..." if needed
  static truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }
}
