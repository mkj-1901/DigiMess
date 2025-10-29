import { authService } from './authService';

export const apiService = {
  async get(endpoint: string): Promise<any> {
    try {
      const response = await authService.axiosInstance.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('GET error:', error);
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  },

  async post(endpoint: string, body: any): Promise<any> {
    try {
      const response = await authService.axiosInstance.post(endpoint, body);
      return response.data;
    } catch (error: any) {
      console.error('POST error:', error);
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  },

  async put(endpoint: string, body: any): Promise<any> {
    try {
      const response = await authService.axiosInstance.put(endpoint, body);
      return response.data;
    } catch (error: any) {
      console.error('PUT error:', error);
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  },

  async delete(endpoint: string): Promise<any> {
    try {
      const response = await authService.axiosInstance.delete(endpoint);
      return response.data;
    } catch (error: any) {
      console.error('DELETE error:', error);
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }
};
