import { test } from '@playwright/test';

/**
 * EN: Decorator that wraps a method as an Allure/Playwright step for reporting.
 *     Makes each method call appear as a named step in reports.
 *     ÙŠØ¬Ø¹Ù„ ÙƒÙ„ Ø§Ø³ØªØ¯Ø¹Ø§Ø¡ Ù…ÙŠØ«ÙˆØ¯ ÙŠØ¸Ù‡Ø± ÙƒØ®Ø·ÙˆØ© Ù…Ø³Ù…Ø§Ø© ÙÙŠ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±.
 * Usage: @step('Descriptive step name')
 */
export function step(stepName: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    // EN: Replace the original method with a step-wrapped version
    descriptor.value = async function (...args: unknown[]) {
      return test.step(stepName, async () => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
