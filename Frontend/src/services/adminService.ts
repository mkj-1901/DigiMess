import { authService } from './authService';
import type { ApiResponse, User, AdminStatsResponse, OptOut, Rebate, Review, MealAttendance } from '../types/User';

export const adminService = {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/users');
      return response.data;
    } catch (error: unknown) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: { name?: string; email?: string; role?: string }): Promise<ApiResponse<User>> {
    try {
      const response = await authService.axiosInstance.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await authService.axiosInstance.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  async createUser(userData: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> {
    try {
      const response = await authService.axiosInstance.post('/admin/users', userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async getStats(): Promise<AdminStatsResponse> {
    try {
      const response = await authService.axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error: unknown) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  async getOptOuts(): Promise<ApiResponse<OptOut[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/optouts');
      return response.data;
    } catch (error: unknown) {
      console.error('Get opt-outs error:', error);
      throw error;
    }
  },

  async getRebates(): Promise<ApiResponse<Rebate[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/rebates');
      return response.data;
    } catch (error: unknown) {
      console.error('Get rebates error:', error);
      throw error;
    }
  },

  async getReviews(): Promise<ApiResponse<Review[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/reviews');
      return response.data;
    } catch (error: unknown) {
      console.error('Get reviews error:', error);
      throw error;
    }
  },

  async getAttendance(): Promise<ApiResponse<MealAttendance[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/attendance');
      return response.data;
    } catch (error: unknown) {
      console.error('Get attendance error:', error);
      throw error;
    }
  },

  async getReviewSummary(): Promise<ApiResponse<any>> {
    try {
      const response = await authService.axiosInstance.get('/admin/reviews/summary');
      return response.data;
    } catch (error: unknown) {
      console.error('Get review summary error:', error);
      throw error;
    }
  }
};
