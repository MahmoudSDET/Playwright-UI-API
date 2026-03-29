/**
 * Common selectors used across tests.
 * Update these when the application's test IDs change.
 */
export const Selectors = {
  // Common
  LOADING_SPINNER: 'ngx-spinner',
  TOAST_SUCCESS: '.toast-success .toast-message',
  TOAST_ERROR: '.toast-error .toast-message',
  TOAST_CONTAINER: '.toast-container',

  // Login
  EMAIL_INPUT: '#userEmail',
  PASSWORD_INPUT: '#userPassword',
  LOGIN_BUTTON: '#login',
  LOGIN_ERROR: '.toast-error .toast-message',

  // Navigation
  NAV_BAR: 'nav',
  NAV_HOME_BUTTON: 'button[routerlink="/dashboard/"]',
  NAV_ORDERS_BUTTON: 'button[routerlink="/dashboard/myorders"]',
  NAV_CART_BUTTON: 'button[routerlink="/dashboard/cart"]',
  NAV_SIGN_OUT: 'button:has-text("Sign Out")',
  CART_BADGE: 'button[routerlink="/dashboard/cart"] span',

  // Dashboard / Products
  PRODUCT_CARD: '.card',
  PRODUCT_NAME: '.card-body h5 b',
  PRODUCT_PRICE: '.card-body .text-muted',
  PRODUCT_VIEW_BTN: '.btn.w-40',
  PRODUCT_ADD_TO_CART_BTN: '.btn.w-10',
  PRODUCT_SEARCH: 'input[placeholder="search"]',
  PRODUCTS_COUNT_TEXT: '.products-header p',

  // Cart
  CART_ITEM: '.cartSection li',
  CART_ITEM_TITLE: 'h3',
  CART_ITEM_PRICE: 'p:has-text("MRP")',
  CART_CHECKOUT_BTN: 'button:has-text("Checkout")',
  CART_TOTAL: '.totalRow .value',
  CART_BUY_NOW_BTN: 'button:has-text("Buy Now")',
  CART_DELETE_BTN: '.btn-danger',

  // Orders
  ORDER_ROW: 'tr',
  ORDER_ID: 'th',
  ORDER_VIEW_BTN: 'button:has-text("View")',
  NO_ORDERS_TEXT: ':text("No Orders")',
  GO_BACK_TO_SHOP: 'button:has-text("Go Back to Shop")',

  // Checkout
  COUNTRY_INPUT: 'input[placeholder="Select Country"]',
  COUNTRY_OPTION: '.ta-results button',
  PLACE_ORDER_BTN: '.btnn',
  COUPON_INPUT: 'input[name="coupon"]',
  APPLY_COUPON_BTN: 'button:has-text("Apply Coupon")',
} as const;
