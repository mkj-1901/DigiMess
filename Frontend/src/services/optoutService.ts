import { authService } from './authService';
import type { OptOut } from '../types/User';

export const optoutService = {
  async submitOptOut(data: { startDate: string; endDate: string; reason: string }): Promise<{ success: boolean; optOut?: OptOut }> {
    try {
      const response = await authService.axiosInstance.post('/optout/request', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit opt-out');
    }
  },

  async getOptOuts(userId: string): Promise<{ success: boolean; optOuts: OptOut[] }> {
    try {
      const response = await authService.axiosInstance.get(`/optout/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get opt-outs');
    }
  },

  async approveOptOut(id: string, data: { approved: boolean; adminNotes?: string }): Promise<{ success: boolean; optOut?: OptOut }> {
    try {
      const response = await authService.axiosInstance.put(`/optout/${id}/approve`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve opt-out');
    }
  }
};
