import { UserBuilder } from '../builders/UserBuilder';
import { OrderBuilder } from '../builders/OrderBuilder';
import { AddressBuilder } from '../builders/AddressBuilder';
import { CreateUserRequest } from '../../api/models/UserModels';
import { CreateOrderRequest } from '../../api/models/OrderModels';
import { Address } from '../builders/AddressBuilder';

/**
 * EN: Factory pattern providing pre-configured test data for common scenarios.
 *     Uses builders internally to construct data objects.
 *     ÙŠØ³ØªØ®Ø¯Ù… Ø§Ù„Ø¨Ø§Ù†ÙŠØ§Øª Ø¯Ø§Ø®Ù„ÙŠÙ‹Ø§ Ù„Ø¨Ù†Ø§Ø¡ ÙƒØ§Ø¦Ù†Ø§Øª Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.
 */
export class TestDataFactory {
  // EN: Create a standard user with default values | AR: Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø³ØªØ®Ø¯Ù… Ù‚ÙŠØ§Ø³ÙŠ Ø¨Ù‚ÙŠÙ… Ø§ÙØªØ±Ø§Ø¶ÙŠØ©
  static createStandardUser(): CreateUserRequest {
    return new UserBuilder().build();
  }

  // EN: Create a unique user with timestamp-based email | AR: Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø³ØªØ®Ø¯Ù… ÙØ±ÙŠØ¯ Ø¨Ø¨Ø±ÙŠØ¯ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø·Ø§Ø¨Ø¹ Ø§Ù„Ø²Ù…Ù†ÙŠ
  static createUniqueUser(suffix?: string): CreateUserRequest {
    const id = suffix || Date.now().toString();
    return new UserBuilder()
      .withEmail(`testuser_${id}@example.com`)
      .withFirstName(`First_${id}`)
      .withLastName(`Last_${id}`)
      .build();
  }

  // EN: Create a standard order with one product | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø·Ù„Ø¨ Ù‚ÙŠØ§Ø³ÙŠ Ø¨Ù…Ù†ØªØ¬ ÙˆØ§Ø­Ø¯
  static createStandardOrder(productId: string): CreateOrderRequest {
    return new OrderBuilder()
      .addProduct(productId, 'India')
      .build();
  }

  // EN: Create a standard address with defaults | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù†ÙˆØ§Ù† Ù‚ÙŠØ§Ø³ÙŠ Ø¨Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©
  static createStandardAddress(): Address {
    return new AddressBuilder().build();
  }
}
