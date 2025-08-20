import type { User, LoginCredentials, AuthResponse } from '../types/User';

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@digimess.com',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'student@digimess.com',
    role: 'student',
    name: 'Student User'
  }
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  'admin@digimess.com': 'admin123',
  'student@digimess.com': 'student123'
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    if (mockPasswords[credentials.email] !== credentials.password) {
      return {
        success: false,
        message: 'Invalid password'
      };
    }

    // Store user in localStorage for session management
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      user
    };
  },

  logout(): void {
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};
