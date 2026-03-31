/**
 * EN: Strategy pattern interface for environment-specific execution behaviour.
 *     Each environment (local, staging, CI) implements this to control setup, teardown, and settings.
 *     ÙƒÙ„ Ø¨ÙŠØ¦Ø© (localØŒ stagingØŒ CI) Ø¨ØªÙ†ÙØ° Ø¯ÙŠ Ø¹Ø´Ø§Ù† ØªØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯ ÙˆØ§Ù„ØªÙ†Ø¸ÙŠÙ ÙˆØ§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.
 */
export interface IExecutionStrategy {
  // EN: Environment-specific setup logic | AR: Ù…Ù†Ø·Ù‚ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø®Ø§Øµ Ø¨Ø§Ù„Ø¨ÙŠØ¦Ø©
  setup(): Promise<void>;
  // EN: Environment-specific teardown logic | AR: Ù…Ù†Ø·Ù‚ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø®Ø§Øµ Ø¨Ø§Ù„Ø¨ÙŠØ¦Ø©
  teardown(): Promise<void>;
  // EN: Get the base URL for this environment | AR: Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ù€ URL Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø¨ÙŠØ¦Ø©
  getBaseURL(): string;
  // EN: Whether to record video during tests | AR: Ù‡Ù„ ÙŠØªÙ… ØªØ³Ø¬ÙŠÙ„ ÙÙŠØ¯ÙŠÙˆ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª
  shouldRecordVideo(): boolean;
  // EN: Number of retry attempts on failure | AR: Ø¹Ø¯Ø¯ Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ´ØºÙŠÙ„ Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„
  getRetryCount(): number;
}
