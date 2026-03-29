/**
 * Common error messages used in assertions.
 */
export const ErrorMessages = {
  LOGIN: {
    INVALID_CREDENTIALS: 'Incorrect email or password.',
    EMAIL_REQUIRED: '*Email is required',
    PASSWORD_REQUIRED: '*Password is required',
    INVALID_EMAIL_FORMAT: '*Enter Valid Email',
  },
  REGISTER: {
    USER_EXISTS: 'User already exisits with this Email Id!',
    FIRST_NAME_REQUIRED: '*First Name is required',
    EMAIL_REQUIRED: '*Email is required',
    PASSWORD_REQUIRED: '*Password is required',
    PASSWORDS_DONT_MATCH: 'Passwords do not match.',
    CHECKBOX_REQUIRED: '*Please check above checkbox',
    SUCCESS: 'Registered Successfully',
  },
  ORDER: {
    NO_ORDERS: 'You have No Orders to show at this time.',
    ORDER_PLACED: 'Order Placed Successfully',
  },
  GENERAL: {
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  },
} as const;
