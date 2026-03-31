// EN: Import Playwright's API request context
import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../../core/base/BaseAPI';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderListResponse,
  ProductListResponse,
} from '../models/OrderModels';

/**
 * EN: API client for order-related endpoints (products, orders, CRUD).
 *     All methods require prior authentication via AuthAPI.login().
 *     Auth headers are attached automatically by RequestInterceptor.
 */
export class OrderAPI extends BaseAPI {
  constructor(request: APIRequestContext) {
    super(request);
  }

  // EN: Fetch all available products
  async getAllProducts(): Promise<ProductListResponse> {
    return this.post<ProductListResponse>('/api/ecom/product/get-all-products', {});
  }

  // EN: Create a new order
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.post<CreateOrderResponse>('/api/ecom/order/create-order', data);
  }

  // EN: Get all orders for a specific customer
  async getOrdersForCustomer(userId: string): Promise<OrderListResponse> {
    return this.get<OrderListResponse>(`/api/ecom/order/get-orders-for-customer/${userId}`);
  }

  // EN: Delete an order by its ID
  async deleteOrder(orderId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/ecom/order/delete-order/${orderId}`);
  }
}
