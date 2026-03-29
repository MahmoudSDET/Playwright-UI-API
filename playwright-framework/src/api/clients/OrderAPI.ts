import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../../core/base/BaseAPI';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderListResponse,
  ProductListResponse,
} from '../models/OrderModels';

export class OrderAPI extends BaseAPI {
  private token = '';

  constructor(request: APIRequestContext) {
    super(request);
  }

  setToken(token: string): void {
    this.token = token;
  }

  async getAllProducts(token: string): Promise<ProductListResponse> {
    return this.postWithAuth<ProductListResponse>('/api/ecom/product/get-all-products', {}, token);
  }

  async createOrder(data: CreateOrderRequest, token: string): Promise<CreateOrderResponse> {
    return this.postWithAuth<CreateOrderResponse>('/api/ecom/order/create-order', data, token);
  }

  async getOrdersForCustomer(userId: string, token: string): Promise<OrderListResponse> {
    return this.getWithAuth<OrderListResponse>(`/api/ecom/order/get-orders-for-customer/${userId}`, token);
  }

  async deleteOrder(orderId: string, token: string): Promise<{ message: string }> {
    return this.deleteWithAuth<{ message: string }>(`/api/ecom/order/delete-order/${orderId}`, token);
  }

  private async postWithAuth<T>(endpoint: string, data: unknown, token: string): Promise<T> {
    this.logger.info(`POST (auth) ${endpoint}`);
    const response = await this.request.post(endpoint, {
      data,
      headers: { Authorization: token },
    });
    return this.handleApiResponse<T>(response);
  }

  private async getWithAuth<T>(endpoint: string, token: string): Promise<T> {
    this.logger.info(`GET (auth) ${endpoint}`);
    const response = await this.request.get(endpoint, {
      headers: { Authorization: token },
    });
    return this.handleApiResponse<T>(response);
  }

  private async deleteWithAuth<T>(endpoint: string, token: string): Promise<T> {
    this.logger.info(`DELETE (auth) ${endpoint}`);
    const response = await this.request.delete(endpoint, {
      headers: { Authorization: token },
    });
    return this.handleApiResponse<T>(response);
  }

  private async handleApiResponse<T>(response: Awaited<ReturnType<typeof this.request.get>>): Promise<T> {
    const body = await response.text();
    if (!response.ok()) {
      this.logger.error(`API Error [${response.status()}]: ${body}`);
      throw new Error(`API request failed with status ${response.status()}: ${body}`);
    }
    return JSON.parse(body) as T;
  }
}
