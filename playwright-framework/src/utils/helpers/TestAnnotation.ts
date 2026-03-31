import { TestInfo } from '@playwright/test';

// EN: Type alias for annotation key-value pairs | AR: Ù†ÙˆØ¹ Ù…Ø®ØªØµØ± Ù„Ø£Ø²ÙˆØ§Ø¬ Ù…ÙØªØ§Ø­-Ù‚ÙŠÙ…Ø© Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙˆØµÙÙŠØ©
type AnnotationMap = Record<string, string>;

/**
 * EN: Dynamically adds annotations to the current test from a key-value map.
 *     Skips empty/null/undefined values. Used for Allure reporting.
 *     ÙŠØªØ®Ø·Ù‰ Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„ÙØ§Ø±ØºØ©/null/undefined. ÙŠØ³ØªØ®Ø¯Ù… Ù„ØªÙ‚Ø§Ø±ÙŠØ± Allure.
 *
 * Usage:
 *   annotate(test.info(), { feature: 'Dashboard', userEmail: 'a@b.com', product: 'Shoes' });
 */
export function annotate(testInfo: TestInfo, data: AnnotationMap): void {
  for (const [type, description] of Object.entries(data)) {
    // EN: Only add non-empty values | AR: Ø£Ø¶Ù ÙÙ‚Ø· Ø§Ù„Ù‚ÙŠÙ… ØºÙŠØ± Ø§Ù„ÙØ§Ø±ØºØ©
    if (description !== undefined && description !== null && description !== '') {
      testInfo.annotations.push({ type, description });
    }
  }
}
