/**
 * EN: Common error/success messages used in test assertions.
 *     Must match the actual messages displayed by the application.
 *     ÙŠØ¬Ø¨ Ø£Ù† ØªØªØ·Ø§Ø¨Ù‚ Ù…Ø¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ÙØ¹Ù„ÙŠØ© Ø§Ù„ØªÙŠ ÙŠØ¹Ø±Ø¶Ù‡Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚.
 */
export const ErrorMessages = {
  // EN: Login error messages | AR: Ø±Ø³Ø§Ø¦Ù„ Ø®Ø·Ø£ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
  LOGIN: {
    INVALID_CREDENTIALS: 'Incorrect email or password.',
    EMAIL_REQUIRED: '*Email is required',
    PASSWORD_REQUIRED: '*Password is required',
    INVALID_EMAIL_FORMAT: '*Enter Valid Email',
  },
  // EN: Registration error/success messages | AR: Ø±Ø³Ø§Ø¦Ù„ Ø®Ø·Ø£/Ù†Ø¬Ø§Ø­ Ø§Ù„ØªØ³Ø¬ÙŠÙ„
  REGISTER: {
    USER_EXISTS: 'User already exisits with this Email Id!',
    FIRST_NAME_REQUIRED: '*First Name is required',
    EMAIL_REQUIRED: '*Email is required',
    PASSWORD_REQUIRED: '*Password is required',
    PASSWORDS_DONT_MATCH: 'Passwords do not match.',
    CHECKBOX_REQUIRED: '*Please check above checkbox',
    SUCCESS: 'Registered Successfully',
  },
  // EN: Order messages | AR: Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª
  ORDER: {
    NO_ORDERS: 'You have No Orders to show at this time.',
    ORDER_PLACED: 'Order Placed Successfully',
  },
  // EN: General error messages | AR: Ø±Ø³Ø§Ø¦Ù„ Ø®Ø·Ø£ Ø¹Ø§Ù…Ø©
  GENERAL: {
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  },
} as const;
