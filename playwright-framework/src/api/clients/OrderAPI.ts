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
 *     All methods require an auth token for authorization.
 *     ÙƒÙ„ Ø§Ù„Ø¯ÙˆØ§Ù„ ØªØªØ·Ù„Ø¨ Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø© Ù„Ù„ØªÙÙˆÙŠØ¶.
 */
export class OrderAPI extends BaseAPI {
  // EN: Stored auth token for requests | AR: Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ø§Ù„Ù…Ø®Ø²Ù† Ù„Ù„Ø·Ù„Ø¨Ø§Øª
  private token = '';

  constructor(request: APIRequestContext) {
    super(request);
  }

  // EN: Set the authentication token | AR: ØªØ¹ÙŠÙŠÙ† Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø©
  setToken(token: string): void {
    this.token = token;
  }

  // EN: Fetch all available products | AR: Ø¬Ù„Ø¨ ÙƒÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©
  async getAllProducts(token: string): Promise<ProductListResponse> {
    return this.postWithAuth<ProductListResponse>('/api/ecom/product/get-all-products', {}, token);
  }

  // EN: Create a new order | AR: Ø¥Ù†Ø´Ø§Ø¡ Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯
  async createOrder(data: CreateOrderRequest, token: string): Promise<CreateOrderResponse> {
    return this.postWithAuth<CreateOrderResponse>('/api/ecom/order/create-order', data, token);
  }

  // EN: Get all orders for a specific customer | AR: Ø¬Ù„Ø¨ ÙƒÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ù„Ø¹Ù…ÙŠÙ„ Ù…Ø­Ø¯Ø¯
  async getOrdersForCustomer(userId: string, token: string): Promise<OrderListResponse> {
    return this.getWithAuth<OrderListResponse>(`/api/ecom/order/get-orders-for-customer/${userId}`, token);
  }

  // EN: Delete an order by its ID | AR: Ø­Ø°Ù Ø·Ù„Ø¨ Ø¨Ù…Ø¹Ø±ÙÙ‡
  async deleteOrder(orderId: string, token: string): Promise<{ message: string }> {
    return this.deleteWithAuth<{ message: string }>(`/api/ecom/order/delete-order/${orderId}`, token);
  }

  // EN: Helper: POST request with Authorization header
  private async postWithAuth<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    this.logger.info(`POST (auth) ${endpoint}`);
    const response = await this.request.post(endpoint, {
      data,
      headers: { Authorization: token },
    });
    return this.handleApiResponse<T>(response);
  }

  // EN: Helper: GET request with Authorization header
  private async getWithAuth<T>(endpoint: string, token: string): Promise<T> {
    this.logger.info(`GET (auth) ${endpoint}`);
    const response = await this.request.get(endpoint, {
      headers: { Authorization: token },
    });
    return this.handleApiResponse<T>(response);
  }

  // EN: Helper: DELETE request with Authorization header
  private async deleteWithAuth<T>(endpoint: string, token: string): Promise<T> {
    this.logger.info(`DELETE (auth) ${endpoint}`);
    const response = await this.request.delete(endpoint, {
      headers: { Authorization: token },
    });
    return this.handleApiResponse<T>(response);
  }

  // EN: Handle API response - parse JSON or throw error
  private async handleApiResponse<T>(response: Awaited<ReturnType<typeof this.request.get>>): Promise<T> {
    const body = await response.text();
    if (!response.ok()) {
      this.logger.error(`API Error [${response.status()}]: ${body}`);
      throw new Error(`API request failed with status ${response.status()}: ${body}`);
    }
    return JSON.parse(body) as T;
  }
}
