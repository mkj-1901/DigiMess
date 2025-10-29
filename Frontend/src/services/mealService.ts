import { authService } from './authService';
import type { MealAttendance } from '../types/User';

export const mealService = {
  async logAttendance(data: { date: string; breakfast?: boolean; lunch?: boolean; dinner?: boolean }): Promise<{ success: boolean; attendance?: MealAttendance }> {
    try {
      const response = await authService.axiosInstance.post('/meals/attendance', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to log attendance');
    }
  },

  async getHistory(userId: string, startDate?: string, endDate?: string): Promise<{ success: boolean; history: MealAttendance[] }> {
    try {
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      const response = await authService.axiosInstance.get(`/meals/${userId}/history?${query.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get history');
    }
  }
};
