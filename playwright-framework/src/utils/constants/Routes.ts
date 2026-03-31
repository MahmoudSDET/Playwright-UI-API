/**
 * EN: Application route constants for UI navigation and API endpoints.
 */
export const Routes = {
  // --- EN: UI Routes (hash-based SPA routing) | AR: Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© (ØªÙˆØ¬ÙŠÙ‡ SPA Ø¨Ø§Ù„Ù‡Ø§Ø´) ---
  HOME: '#/dashboard/dash',
  LOGIN: '#/auth/login',
  REGISTER: '#/auth/register',
  DASHBOARD: '#/dashboard/dash',
  CART: '#/dashboard/cart',
  ORDERS: '#/dashboard/myorders',
  ORDER_DETAILS: '#/dashboard/order',
  FORGOT_PASSWORD: '#/auth/password-new',

  // --- EN: API Routes | AR: Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„Ù€ API ---
  API: {
    AUTH_LOGIN: '/api/ecom/auth/login',
    AUTH_REGISTER: '/api/ecom/auth/register',
    GET_PRODUCTS: '/api/ecom/product/get-all-products',
    ADD_TO_CART: '/api/ecom/user/add-to-cart',
    GET_CART: '/api/ecom/user/get-cart-count',
    CREATE_ORDER: '/api/ecom/order/create-order',
    GET_ORDERS: '/api/ecom/order/get-orders-for-customer',
    GET_ORDER_BY_ID: '/api/ecom/order/get-orders-details',
    DELETE_ORDER: '/api/ecom/order/delete-order',
  },
} as const;
