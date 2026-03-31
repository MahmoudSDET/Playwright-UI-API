/**
 * EN: Interface representing a user entity from the API.
 */
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  userMobile: string;
  userRole: string;
  occupation: string;
  gender: string;
}

/**
 * EN: Interface for creating a new user request.
 */
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  confirmPassword: string;
  userMobile: string;
  occupation: string;
  gender: string;
  required18: boolean;
}

/**
 * EN: Interface for updating an existing user (partial fields).
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  userEmail?: string;
  userMobile?: string;
}

/**
 * EN: Interface for user API response wrapper.
 */
export interface UserResponse {
  data: User;
  message: string;
}
