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

export interface OrderItem {
  product: string;
  quantity: number;
}

export interface CreateOrderRequest {
  orders: { country: string; productOrderedId: string }[];
}

export interface CreateOrderResponse {
  orders: string[];
  productOrderId: string[];
  message: string;
}

export interface Order {
  _id: string;
  orderById: string;
  productOrderedId: string;
  country: string;
}

export interface OrderListResponse {
  data: Order[];
  message: string;
}

export interface ProductListResponse {
  data: Product[];
  message: string;
  count: number;
}
