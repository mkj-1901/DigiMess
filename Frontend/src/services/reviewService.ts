import { authService } from './authService';
import type { Review } from '../types/User';

export const reviewService = {
  async submitReview(data: { mealDate: string; rating: number; comment?: string }): Promise<{ success: boolean; review?: Review }> {
    try {
      const response = await authService.axiosInstance.post('/reviews/submit', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit review');
    }
  },

  async getReviews(userId: string): Promise<{ success: boolean; reviews: Review[] }> {
    try {
      const response = await authService.axiosInstance.get(`/reviews/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get reviews');
    }
  },

  async getAllReviews(): Promise<{ success: boolean; reviews: Review[] }> {
    try {
      const response = await authService.axiosInstance.get('/reviews/admin');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get all reviews');
    }
  },

  async approveReview(id: string, approved: boolean): Promise<{ success: boolean; review?: Review }> {
    try {
      const response = await authService.axiosInstance.put(`/reviews/${id}/approve`, { approved });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve review');
    }
  }
};
