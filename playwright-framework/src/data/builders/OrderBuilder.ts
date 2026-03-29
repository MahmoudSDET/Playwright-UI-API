import { CreateOrderRequest } from '../../api/models/OrderModels';

/**
 * Builder pattern for constructing order test data.
 */
export class OrderBuilder {
  private data: CreateOrderRequest = {
    orders: [],
  };

  addProduct(productId: string, country: string): this {
    this.data.orders.push({ productOrderedId: productId, country });
    return this;
  }

  build(): CreateOrderRequest {
    return { ...this.data, orders: [...this.data.orders] };
  }
}
