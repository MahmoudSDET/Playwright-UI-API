// EN: Import Playwright's base test and Logger
import { test as base, TestInfo } from '@playwright/test';
import { Logger } from '../core/logger/Logger';

const logger = Logger.getInstance();

// EN: Extract the feature name (describe block) from test info
function extractFeature(testInfo: TestInfo): string {
  const parts = testInfo.titlePath;
  // EN: titlePath = ['', 'describe title', 'test title'] â€” index 1 is the describe block
  return parts.length > 2 ? parts[1] : 'Unknown';
}

// EN: Extract the test suite folder name (ui, api, or hybrid)
function extractSuite(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  const testsIdx = parts.indexOf('tests');
  if (testsIdx >= 0 && testsIdx + 1 < parts.length) {
    return parts[testsIdx + 1]; // 'ui', 'api', or 'hybrid'
  }
  return 'unknown';
}

/**
 * EN: Logging fixture that auto-annotates tests with metadata and logs start/end.
 *     Automatically enabled for all tests (auto: true).
 *     Ù…ÙØ¹Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ù„ÙƒÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª (auto: true).
 */
export const loggingFixture = base.extend<{
  autoLogAnnotations: void;
}>({
  autoLogAnnotations: [
    async ({}, use, testInfo) => {
      // EN: Extract test metadata for annotations
      const testTitle = testInfo.title;
      const testFile = testInfo.file.split(/[\\/]/).pop() ?? '';
      const feature = extractFeature(testInfo);
      const suite = extractSuite(testInfo.file);
      const project = testInfo.project.name;

      // EN: Auto-annotate with test info metadata for reporting
      testInfo.annotations.push({ type: 'feature', description: feature });
      testInfo.annotations.push({ type: 'suite', description: suite });
      testInfo.annotations.push({ type: 'file', description: testFile });
      testInfo.annotations.push({ type: 'project', description: project });

      // EN: Log test start | AR: ØªØ³Ø¬ÙŠÙ„ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
      logger.info(`â–¶ Starting test: "${testTitle}" [${testFile}] | Feature: ${feature} | Suite: ${suite} | Project: ${project}`);

      await use();

      // EN: Log all annotations after test completes
      const annotations = testInfo.annotations;
      if (annotations.length > 0) {
        logger.info(`ðŸ“‹ Test annotations for "${testTitle}":`);
        for (const annotation of annotations) {
          logger.info(`   [${annotation.type}]: ${annotation.description}`);
        }
      }

      // EN: Log test result (passed/failed) with duration
      const status = testInfo.status ?? 'unknown';
      const duration = testInfo.duration;
      logger.info(
        `${status === 'passed' ? 'âœ…' : 'âŒ'} Test "${testTitle}" ${status} (${duration}ms)`,
      );
    },
    // EN: Auto-enabled for all tests | AR: Ù…ÙØ¹Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ù„ÙƒÙ„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª
    { auto: true },
  ],
});
