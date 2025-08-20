export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
