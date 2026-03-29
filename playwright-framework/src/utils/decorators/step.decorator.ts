import { test } from '@playwright/test';

/**
 * Decorator that wraps a method as an Allure step for reporting.
 * Usage: @step('Descriptive step name')
 */
export function step(stepName: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return test.step(stepName, async () => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
