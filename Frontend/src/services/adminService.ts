import { authService } from './authService';
import type { ApiResponse, User, AdminStatsResponse, OptOut, Rebate, Review, MealAttendance } from '../types/User';
import axios from 'axios';

// Helper utility to safely extract and format backend messages from an unknown error
const handleAdminError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.message || fallbackMessage);
  }
  throw new Error(fallbackMessage);
};

export const adminService = {
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/users');
      return response.data;
    } catch (error: unknown) {
      console.error('Get users error:', error);
      return handleAdminError(error, 'Failed to fetch user directory');
    }
  },

  async updateUser(userId: string, userData: { name?: string; email?: string; role?: string }): Promise<ApiResponse<User>> {
    try {
      const response = await authService.axiosInstance.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Update user error:', error);
      return handleAdminError(error, 'Failed to update user configurations');
    }
  },

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await authService.axiosInstance.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Delete user error:', error);
      return handleAdminError(error, 'Failed to remove user from database');
    }
  },

  async createUser(userData: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> {
    try {
      const response = await authService.axiosInstance.post('/admin/users', userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Create user error:', error);
      return handleAdminError(error, 'Failed to register new profile');
    }
  },

  async getStats(): Promise<AdminStatsResponse> {
    try {
      const response = await authService.axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error: unknown) {
      console.error('Get stats error:', error);
      return handleAdminError(error, 'Failed to extract system performance metrics');
    }
  },

  async getOptOuts(): Promise<ApiResponse<OptOut[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/optouts');
      return response.data;
    } catch (error: unknown) {
      console.error('Get opt-outs error:', error);
      return handleAdminError(error, 'Failed to parse opt-out logs');
    }
  },

  async getRebates(): Promise<ApiResponse<Rebate[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/rebates');
      return response.data;
    } catch (error: unknown) {
      console.error('Get rebates error:', error);
      return handleAdminError(error, 'Failed to load transaction rebate ledgers');
    }
  },

  async getReviews(): Promise<ApiResponse<Review[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/reviews');
      return response.data;
    } catch (error: unknown) {
      console.error('Get reviews error:', error);
      return handleAdminError(error, 'Failed to read feedback metrics');
    }
  },

  async getAttendance(): Promise<ApiResponse<MealAttendance[]>> {
    try {
      const response = await authService.axiosInstance.get('/admin/attendance');
      return response.data;
    } catch (error: unknown) {
      console.error('Get attendance error:', error);
      return handleAdminError(error, 'Failed to pull operational meal charts');
    }
  },

  async getReviewSummary(): Promise<ApiResponse<any>> {
    try {
      const response = await authService.axiosInstance.get('/admin/reviews/summary');
      return response.data;
    } catch (error: unknown) {
      console.error('Get review summary error:', error);
      return handleAdminError(error, 'Failed to compile analysis summary');
    }
  }
};