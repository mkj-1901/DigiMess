import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { User, LoginCredentials, AuthResponse } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper utility to safely wipe local auth storage without relying on uninitialized authService
const clearLocalAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger only on 401 and prevent infinite recursion loops using _retry flag
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use vanilla axios instance to avoid sending expired auth headers to the refresh endpoint
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            // Update tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry original request with new token attached
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // FIX: Replaced authService.logout() with clean manual swipe to avoid circular reference crashes
        clearLocalAuthData();
        window.location.href = '/'; 
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const data = response.data;

      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  async signup(userData: { name: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/register', {
        ...userData,
        role: 'student'
      });
      const data = response.data;

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return {
          success: true,
          user: data.user,
          message: data.message || 'Signup successful'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Signup failed'
        };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearLocalAuthData();
    }
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getAccessToken();
    return user !== null && token !== null;
  },

  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  async googleLogin(credential: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      const data = response.data;

      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Google login failed'
        };
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link'
      };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  },

  async updateProfile(userData: { name?: string; email?: string; password?: string }): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await axiosInstance.put('/auth/update-profile', userData);
      const data = response.data;

      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Profile update failed'
        };
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  axiosInstance,
};