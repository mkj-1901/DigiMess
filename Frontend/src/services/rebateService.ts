import { authService } from './authService';
import type { Rebate } from '../types/User';

export const rebateService = {
  async calculateRebate(userId: string, monthYear: string): Promise<{ success: boolean; rebate?: Rebate }> {
    try {
      const response = await authService.axiosInstance.get(`/rebate/${userId}/calculate?monthYear=${monthYear}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to calculate rebate');
    }
  },

  async getRebates(userId: string): Promise<{ success: boolean; rebates: Rebate[] }> {
    try {
      const response = await authService.axiosInstance.get(`/rebate/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get rebates');
    }
  },

  async approveRebate(id: string, data: { status: string; notes?: string }): Promise<{ success: boolean; rebate?: Rebate }> {
    try {
      const response = await authService.axiosInstance.put(`/rebate/${id}/approve`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve rebate');
    }
  }
};
