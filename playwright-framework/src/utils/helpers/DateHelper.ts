/**
 * Date utility helpers for test data generation and assertions.
 */
export class DateHelper {
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  static daysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

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

  static isWithinMinutes(date: Date, minutes: number): boolean {
    const diff = Math.abs(Date.now() - date.getTime());
    return diff <= minutes * 60 * 1000;
  }
}
