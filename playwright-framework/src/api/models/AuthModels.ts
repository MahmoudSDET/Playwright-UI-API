/**
 * EN: Interface for login request payload.
 */
export interface LoginRequest {
  // EN: User's email address | AR: Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…
  userEmail: string;
  // EN: User's password | AR: ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  userPassword: string;
}

/**
 * EN: Interface for login response from the API.
 */
export interface LoginResponse {
  // EN: JWT authentication token | AR: Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø© JWT
  token: string;
  // EN: Unique user identifier | AR: Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„ÙØ±ÙŠØ¯
  userId: string;
  // EN: Response message | AR: Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©
  message: string;
}

/**
 * EN: Interface for user registration request payload.
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  confirmPassword: string;
  userMobile: string;
  occupation: string;
  gender: string;
  // EN: Must be true (user must be 18+) | AR: Ù„Ø§Ø²Ù… ÙŠÙƒÙˆÙ† true (Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù„Ø§Ø²Ù… ÙŠÙƒÙˆÙ† 18+)
  required18: boolean;
}

/**
 * EN: Interface for registration response from the API.
 */
export interface RegisterResponse {
  userId: string;
  message: string;
}
