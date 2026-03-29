import { UserBuilder } from '../builders/UserBuilder';
import { OrderBuilder } from '../builders/OrderBuilder';
import { AddressBuilder } from '../builders/AddressBuilder';
import { CreateUserRequest } from '../../api/models/UserModels';
import { CreateOrderRequest } from '../../api/models/OrderModels';
import { Address } from '../builders/AddressBuilder';

/**
 * Factory pattern providing pre-configured test data for common scenarios.
 */
export class TestDataFactory {
  static createStandardUser(): CreateUserRequest {
    return new UserBuilder().build();
  }

  static createUniqueUser(suffix?: string): CreateUserRequest {
    const id = suffix || Date.now().toString();
    return new UserBuilder()
      .withEmail(`testuser_${id}@example.com`)
      .withFirstName(`First_${id}`)
      .withLastName(`Last_${id}`)
      .build();
  }

  static createStandardOrder(productId: string): CreateOrderRequest {
    return new OrderBuilder()
      .addProduct(productId, 'India')
      .build();
  }

  static createStandardAddress(): Address {
    return new AddressBuilder().build();
  }
}
