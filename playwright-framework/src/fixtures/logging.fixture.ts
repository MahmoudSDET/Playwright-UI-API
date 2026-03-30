import { test as base, TestInfo } from '@playwright/test';
import { Logger } from '../core/logger/Logger';

const logger = Logger.getInstance();

function extractFeature(testInfo: TestInfo): string {
  const parts = testInfo.titlePath;
  // titlePath = ['', 'describe title', 'test title'] — index 1 is the describe block
  return parts.length > 2 ? parts[1] : 'Unknown';
}

function extractSuite(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  const testsIdx = parts.indexOf('tests');
  if (testsIdx >= 0 && testsIdx + 1 < parts.length) {
    return parts[testsIdx + 1]; // 'ui', 'api', or 'hybrid'
  }
  return 'unknown';
}

export const loggingFixture = base.extend<{
  autoLogAnnotations: void;
}>({
  autoLogAnnotations: [
    async ({}, use, testInfo) => {
      const testTitle = testInfo.title;
      const testFile = testInfo.file.split(/[\\/]/).pop() ?? '';
      const feature = extractFeature(testInfo);
      const suite = extractSuite(testInfo.file);
      const project = testInfo.project.name;

      // Auto-annotate with test info metadata
      testInfo.annotations.push({ type: 'feature', description: feature });
      testInfo.annotations.push({ type: 'suite', description: suite });
      testInfo.annotations.push({ type: 'file', description: testFile });
      testInfo.annotations.push({ type: 'project', description: project });

      logger.info(`▶ Starting test: "${testTitle}" [${testFile}] | Feature: ${feature} | Suite: ${suite} | Project: ${project}`);

      await use();

      const annotations = testInfo.annotations;
      if (annotations.length > 0) {
        logger.info(`📋 Test annotations for "${testTitle}":`);
        for (const annotation of annotations) {
          logger.info(`   [${annotation.type}]: ${annotation.description}`);
        }
      }

      const status = testInfo.status ?? 'unknown';
      const duration = testInfo.duration;
      logger.info(
        `${status === 'passed' ? '✅' : '❌'} Test "${testTitle}" ${status} (${duration}ms)`,
      );
    },
    { auto: true },
  ],
});
