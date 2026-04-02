// EN: Import Playwright's expect for assertion logic and test for step/attach support
import { expect, TestInfo } from '@playwright/test';
import { Logger } from '../../core/logger/Logger';

// EN: Represents a single soft assertion failure
interface SoftAssertFailure {
  description: string;
  expected: unknown;
  actual: unknown;
  error: string;
}

/**
 * EN: SoftAssert helper class that collects assertion failures without stopping the test.
 *     All failures are logged, attached to the Allure report, and thrown at the end via assertAll().
 *     كل الفشل يتم تسجيله وإرفاقه بتقرير Allure ويتم رميه في النهاية عبر assertAll().
 *
 * Usage:
 *   softAssert.assertEqual('Page title', actualTitle, 'Dashboard');
 *   softAssert.assertTrue('Products visible', isVisible);
 *   await softAssert.assertAll(); // Throws if any soft assertion failed
 */
export class SoftAssert {
  private failures: SoftAssertFailure[] = [];
  private passCount = 0;
  private readonly logger: Logger;
  private readonly testInfo: TestInfo;

  constructor(testInfo: TestInfo) {
    this.logger = Logger.getInstance();
    this.testInfo = testInfo;
  }

  // EN: Soft-check that actual equals expected
  assertEqual(description: string, actual: unknown, expected: unknown): void {
    try {
      expect(actual).toEqual(expected);
      this.passCount++;
      this.logger.info(`✔ [SoftAssert] PASS: ${description} | actual: ${JSON.stringify(actual)}`);
    } catch (e) {
      this.addFailure(description, expected, actual, (e as Error).message);
    }
  }

  // EN: Soft-check that a condition is truthy
  assertTrue(description: string, actual: unknown): void {
    try {
      expect(actual).toBeTruthy();
      this.passCount++;
      this.logger.info(`✔ [SoftAssert] PASS: ${description} | actual: ${JSON.stringify(actual)}`);
    } catch (e) {
      this.addFailure(description, 'truthy', actual, (e as Error).message);
    }
  }

  // EN: Soft-check that a condition is falsy
  assertFalse(description: string, actual: unknown): void {
    try {
      expect(actual).toBeFalsy();
      this.passCount++;
      this.logger.info(`✔ [SoftAssert] PASS: ${description} | actual: ${JSON.stringify(actual)}`);
    } catch (e) {
      this.addFailure(description, 'falsy', actual, (e as Error).message);
    }
  }

  // EN: Soft-check that a string contains expected substring
  assertContains(description: string, actual: string, expected: string): void {
    try {
      expect(actual).toContain(expected);
      this.passCount++;
      this.logger.info(`✔ [SoftAssert] PASS: ${description} | actual: "${actual}" contains "${expected}"`);
    } catch (e) {
      this.addFailure(description, `contains "${expected}"`, actual, (e as Error).message);
    }
  }

  // EN: Soft-check that actual is greater than expected
  assertGreaterThan(description: string, actual: number, expected: number): void {
    try {
      expect(actual).toBeGreaterThan(expected);
      this.passCount++;
      this.logger.info(`✔ [SoftAssert] PASS: ${description} | actual: ${actual} > ${expected}`);
    } catch (e) {
      this.addFailure(description, `> ${expected}`, actual, (e as Error).message);
    }
  }

  // EN: Record a failure and log it
  private addFailure(description: string, expected: unknown, actual: unknown, error: string): void {
    const failure: SoftAssertFailure = { description, expected, actual, error };
    this.failures.push(failure);
    this.logger.error(`✘ [SoftAssert] FAIL: ${description} | expected: ${JSON.stringify(expected)} | actual: ${JSON.stringify(actual)}`);
  }

  // EN: Returns true if there are any failures
  hasFailures(): boolean {
    return this.failures.length > 0;
  }

  // EN: Get the count of passed assertions
  getPassCount(): number {
    return this.passCount;
  }

  // EN: Get the count of failed assertions
  getFailCount(): number {
    return this.failures.length;
  }

  // EN: Attach the summary to the Allure report and throw if any failures exist
  //     Must be called at the end of a test to finalize soft assertions.
  async assertAll(): Promise<void> {
    const total = this.passCount + this.failures.length;
    const summary = {
      total,
      passed: this.passCount,
      failed: this.failures.length,
      failures: this.failures.map((f, i) => ({
        '#': i + 1,
        description: f.description,
        expected: f.expected,
        actual: f.actual,
      })),
    };

    // EN: Attach the soft-assert summary to the test (visible in Allure & HTML reports)
    await this.testInfo.attach('Soft Assert Summary', {
      body: JSON.stringify(summary, null, 2),
      contentType: 'application/json',
    });

    if (this.failures.length > 0) {
      const lines = this.failures.map(
        (f, i) => `  ${i + 1}) ${f.description}\n     Expected: ${JSON.stringify(f.expected)}\n     Actual:   ${JSON.stringify(f.actual)}`,
      );
      const message = `SoftAssert: ${this.failures.length} of ${total} assertion(s) failed:\n${lines.join('\n')}`;
      this.logger.error(message);
      throw new Error(message);
    }

    this.logger.info(`✔ [SoftAssert] All ${total} assertion(s) passed`);
  }
}
