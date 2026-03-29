export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  message: string;
}

export interface RegisterRequest {
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

export interface RegisterResponse {
  userId: string;
  message: string;
}
