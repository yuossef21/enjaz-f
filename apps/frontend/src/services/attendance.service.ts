import api from './api';
import { Attendance } from '@/types';

export const attendanceService = {
  async checkIn(data: {
    location_lat?: number;
    location_lng?: number;
    notes?: string;
  }): Promise<Attendance> {
    const { data: response } = await api.post<Attendance>('/attendance/check-in', data);
    return response;
  },

  async checkOut(): Promise<Attendance> {
    const { data } = await api.post<Attendance>('/attendance/check-out');
    return data;
  },

  async getAttendance(params?: {
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Attendance[]> {
    const { data } = await api.get<Attendance[]>('/attendance', { params });
    return data;
  },

  async getMyRecords(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<Attendance[]> {
    const { data } = await api.get<Attendance[]>('/attendance/my-records', { params });
    return data;
  },

  async exportToExcel(params?: {
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    const { data } = await api.get('/attendance/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
