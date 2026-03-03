import api from './api';
import type { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import type { ApiResponse } from '@/types/common';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<ApiResponse<User>>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials) => {
    const { data } = await api.post<ApiResponse<User>>('/auth/register', credentials);
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/profile');
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/password', { currentPassword, newPassword });
    return data;
  },
};
