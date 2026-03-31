/**
 * EN: Date utility helpers for test data generation and assertions.
 */
export class DateHelper {
  // EN: Get today's date in ISO format (YYYY-MM-DD) | AR: Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ ØªØ§Ø±ÙŠØ® Ø§Ù„ÙŠÙˆÙ… Ø¨ØµÙŠØºØ© ISO
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // EN: Get a date N days from now | AR: Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ ØªØ§Ø±ÙŠØ® Ø¨Ø¹Ø¯ N ÙŠÙˆÙ… Ù…Ù† Ø§Ù„Ø¢Ù†
  static daysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  // EN: Format a date in ISO, US (MM/DD/YYYY), or EU (DD/MM/YYYY) format
  static formatDate(date: Date, format: 'iso' | 'us' | 'eu' = 'iso'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
      case 'us':
        return `${month}/${day}/${year}`;
      case 'eu':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  // EN: Check if a date is within N minutes of now | AR: ØªØ­Ù‚Ù‚ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªØ§Ø±ÙŠØ® ÙÙŠ Ø­Ø¯ÙˆØ¯ N Ø¯Ù‚ÙŠÙ‚Ø© Ù…Ù† Ø§Ù„Ø¢Ù†
  static isWithinMinutes(date: Date, minutes: number): boolean {
    const diff = Math.abs(Date.now() - date.getTime());
    return diff <= minutes * 60 * 1000;
  }
}
