import { TestInfo } from '@playwright/test';

type AnnotationMap = Record<string, string>;

/**
 * Dynamically adds annotations to the current test from a key-value map.
 *
 * Usage:
 *   annotate(test.info(), { feature: 'Dashboard', userEmail: 'a@b.com', product: 'Shoes' });
 */
export function annotate(testInfo: TestInfo, data: AnnotationMap): void {
  for (const [type, description] of Object.entries(data)) {
    if (description !== undefined && description !== null && description !== '') {
      testInfo.annotations.push({ type, description });
    }
  }
}
