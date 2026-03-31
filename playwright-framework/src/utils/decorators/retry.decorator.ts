/**
 * EN: Decorator that retries a method on failure with configurable attempts and delay.
 *     Useful for flaky operations that may succeed on retry.
 *     Ù…ÙÙŠØ¯ Ù„Ù„Ø¹Ù…Ù„ÙŠØ§Øª ØºÙŠØ± Ø§Ù„Ù…Ø³ØªÙ‚Ø±Ø© Ø§Ù„ØªÙŠ Ù‚Ø¯ ØªÙ†Ø¬Ø­ Ø¹Ù†Ø¯ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©.
 * Usage: @retry(3, 1000)
 */
export function retry(maxAttempts = 3, delayMs = 1000) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    // EN: Replace original method with retry-wrapped version
    descriptor.value = async function (...args: unknown[]) {
      let lastError: Error | undefined;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxAttempts) {
            // EN: Log retry attempt and wait before next try
            console.warn(
              `[Retry] ${propertyKey} attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      // EN: All attempts exhausted, throw last error
      throw lastError;
    };

    return descriptor;
  };
}
