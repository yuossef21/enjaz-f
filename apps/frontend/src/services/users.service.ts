import api from './api';
import { User } from '@/types';

export const usersService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getUserById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    permissions?: string[];
  }): Promise<User> {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, updates);
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async resetPassword(id: string, new_password: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { new_password });
  },
};
