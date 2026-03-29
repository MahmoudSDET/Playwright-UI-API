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

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  userEmail?: string;
  userMobile?: string;
}

export interface UserResponse {
  data: User;
  message: string;
}
