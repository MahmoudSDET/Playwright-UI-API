import { baseFixture } from './base.fixture';
import { TestDataFactory } from '../data/factories/TestDataFactory';
import { CreateUserRequest } from '../api/models/UserModels';
import { CreateOrderRequest } from '../api/models/OrderModels';

export type DataFixtures = {
  testUser: CreateUserRequest;
  testOrder: CreateOrderRequest;
};

export const dataFixture = baseFixture.extend<DataFixtures>({
  testUser: async ({}, use) => {
    const user = TestDataFactory.createUniqueUser();
    await use(user);
  },

  testOrder: async ({}, use) => {
    const order = TestDataFactory.createStandardOrder('product-id-placeholder');
    await use(order);
  },
});
