import { CreateOrderRequest } from '../../api/models/OrderModels';

/**
 * EN: Builder pattern for constructing order test data.
 *     Allows adding products one by one with fluent API.
 *     ÙŠØ³Ù…Ø­ Ø¨Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª ÙˆØ§Ø­Ø¯Ù‹Ø§ ØªÙ„Ùˆ Ø§Ù„Ø¢Ø®Ø± Ø¨ÙˆØ§Ø¬Ù‡Ø© Ø³Ù„Ø³Ø©.
 */
export class OrderBuilder {
  // EN: Initialize with empty orders array | AR: Ø§Ù„ØªÙ‡ÙŠØ¦Ø© Ø¨Ù…ØµÙÙˆÙØ© Ø·Ù„Ø¨Ø§Øª ÙØ§Ø±ØºØ©
  private data: CreateOrderRequest = {
    orders: [],
  };

  // EN: Add a product (by ID) with its shipping country | AR: Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬ (Ø¨Ø§Ù„Ù…Ø¹Ø±Ù) Ù…Ø¹ Ø¯ÙˆÙ„Ø© Ø§Ù„Ø´Ø­Ù†
  addProduct(productId: string, country: string): this {
    this.data.orders.push({ productOrderedId: productId, country });
    return this;
  }

  // EN: Build and return a deep copy of the order data | AR: Ø¨Ù†Ø§Ø¡ ÙˆØ¥Ø±Ø¬Ø§Ø¹ Ù†Ø³Ø®Ø© Ø¹Ù…ÙŠÙ‚Ø© Ù…Ù† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨
  build(): CreateOrderRequest {
    return { ...this.data, orders: [...this.data.orders] };
  }
}
