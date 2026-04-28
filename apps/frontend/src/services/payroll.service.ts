import api from './api';
import { PayrollRecord } from '@/types';

export const payrollService = {
  async getPayrollRecords(params?: {
    employee_id?: string;
    month?: string;
    year?: number;
    status?: string;
  }): Promise<PayrollRecord[]> {
    const { data } = await api.get<PayrollRecord[]>('/payroll', { params });
    return data;
  },

  async getPayrollRecordById(id: string): Promise<PayrollRecord> {
    const { data } = await api.get<PayrollRecord>(`/payroll/${id}`);
    return data;
  },

  async createPayrollRecord(recordData: Partial<PayrollRecord>): Promise<PayrollRecord> {
    const { data } = await api.post<PayrollRecord>('/payroll', recordData);
    return data;
  },

  async updatePayrollRecord(id: string, updates: Partial<PayrollRecord>): Promise<PayrollRecord> {
    const { data } = await api.patch<PayrollRecord>(`/payroll/${id}`, updates);
    return data;
  },

  async approvePayrollRecord(id: string): Promise<PayrollRecord> {
    const { data } = await api.post<PayrollRecord>(`/payroll/${id}/approve`);
    return data;
  },

  async markAsPaid(id: string): Promise<PayrollRecord> {
    const { data } = await api.post<PayrollRecord>(`/payroll/${id}/pay`);
    return data;
  },

  async deletePayrollRecord(id: string): Promise<void> {
    await api.delete(`/payroll/${id}`);
  },

  async exportToExcel(params?: { status?: string; year?: number }): Promise<Blob> {
    const { data } = await api.get('/payroll/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
