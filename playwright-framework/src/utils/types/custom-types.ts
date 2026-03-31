/**
 * EN: Generic API response wrapper used across API clients.
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * EN: Pagination parameters for list/search API calls.
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * EN: Test metadata attached to test results for reporting.
 */
export interface TestMeta {
  // EN: Test severity level | AR: Ù…Ø³ØªÙˆÙ‰ Ø®Ø·ÙˆØ±Ø© Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
  severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
  // EN: Feature being tested | AR: Ø§Ù„Ù…ÙŠØ²Ø© Ø§Ù„ØªÙŠ ÙŠØªÙ… Ø§Ø®ØªØ¨Ø§Ø±Ù‡Ø§
  feature: string;
  story?: string;
  owner?: string;
}
