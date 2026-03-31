/**
 * EN: Interface representing a product entity.
 */
export interface Product {
  _id: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productSubCategory: string;
  productDescription: string;
  productImage: string;
  productFor: string;
  productAddedBy: string;
}

/**
 * EN: Interface for an order item (product + quantity).
 */
export interface OrderItem {
  product: string;
  quantity: number;
}

/**
 * EN: Interface for the create order request payload.
 */
export interface CreateOrderRequest {
  orders: { country: string; productOrderedId: string }[];
}

/**
 * EN: Interface for the create order API response.
 */
export interface CreateOrderResponse {
  orders: string[];
  productOrderId: string[];
  message: string;
}

/**
 * EN: Interface representing a single order entity.
 */
export interface Order {
  _id: string;
  orderById: string;
  productOrderedId: string;
  country: string;
}

/**
 * EN: Interface for the order list API response.
 */
export interface OrderListResponse {
  data: Order[];
  message: string;
}

/**
 * EN: Interface for the product list API response.
 */
export interface ProductListResponse {
  data: Product[];
  message: string;
  count: number;
}
