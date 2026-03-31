import { CreateUserRequest } from '../../api/models/UserModels';

/**
 * EN: Builder pattern for constructing user test data step by step.
 *     Provides fluent API with method chaining.
 *     ÙŠÙˆÙØ± ÙˆØ§Ø¬Ù‡Ø© Ø³Ù„Ø³Ø© Ù…Ø¹ ØªØ³Ù„Ø³Ù„ Ø§Ù„Ù…ÙŠØ«ÙˆØ¯Ø§Øª.
 */
export class UserBuilder {
  // EN: Default user data | AR: Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©
  private data: CreateUserRequest = {
    firstName: 'Test',
    lastName: 'User',
    userEmail: 'testuser@example.com',
    userPassword: 'Test@12345',
    confirmPassword: 'Test@12345',
    userMobile: '1234567890',
    occupation: 'Student',
    gender: 'Male',
    required18: true,
  };

  // EN: Set email | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ
  withEmail(email: string): this {
    this.data.userEmail = email;
    return this;
  }

  // EN: Set password (both fields) | AR: ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± (Ø§Ù„Ø­Ù‚Ù„ÙŠÙ†)
  withPassword(password: string): this {
    this.data.userPassword = password;
    this.data.confirmPassword = password;
    return this;
  }

  // EN: Set first name | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø£ÙˆÙ„
  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  // EN: Set last name | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø§Ø³Ù… Ø§Ù„Ø£Ø®ÙŠØ±
  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  // EN: Set phone number | AR: ØªØ¹ÙŠÙŠÙ† Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ
  withPhone(phone: string): this {
    this.data.userMobile = phone;
    return this;
  }

  // EN: Set occupation | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù…Ù‡Ù†Ø©
  withOccupation(occupation: string): this {
    this.data.occupation = occupation;
    return this;
  }

  // EN: Set gender | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¬Ù†Ø³
  withGender(gender: string): this {
    this.data.gender = gender;
    return this;
  }

  // EN: Build and return a copy of the user data | AR: Ø¨Ù†Ø§Ø¡ ÙˆØ¥Ø±Ø¬Ø§Ø¹ Ù†Ø³Ø®Ø© Ù…Ù† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
  build(): CreateUserRequest {
    return { ...this.data };
  }
}
