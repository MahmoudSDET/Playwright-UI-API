// EN: Import test data from JSON file
import testData from './test-data.json';

// EN: Export commonly used test data sections (credentials, products, etc.)
export const { credentials, products, checkout, messages, urls } = testData;

/**
 * EN: Registration data helper - provides defaults and a payload builder
 *     that replaces {{uniqueId}} in the email template.
 *     ÙŠØ³ØªØ¨Ø¯Ù„ {{uniqueId}} ÙÙŠ Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.
 */
export const registration = {
  defaults: testData.registration,
  // EN: Build registration payload with unique email
  buildPayload(uniqueId: string) {
    const r = testData.registration;
    return {
      firstName: r.firstName,
      lastName: r.lastName,
      userEmail: r.emailTemplate.replace('{{uniqueId}}', uniqueId),
      userPassword: r.password,
      confirmPassword: r.confirmPassword,
      userMobile: r.phone,
      occupation: r.occupation,
      gender: r.gender,
      required18: r.required18,
    };
  },
};
