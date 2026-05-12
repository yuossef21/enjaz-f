import api from './api';
import { CustomerIssue } from '@/types';

export const customerIssuesService = {
  async getCustomerIssues(params?: {
    status?: string;
    search?: string;
    created_by?: string;
    date?: string;
    month?: string;
  }): Promise<CustomerIssue[]> {
    const { data } = await api.get<CustomerIssue[]>('/customer-issues', { params });
    return data;
  },

  async getCustomerIssueById(id: string): Promise<CustomerIssue> {
    const { data } = await api.get<CustomerIssue>(`/customer-issues/${id}`);
    return data;
  },

  async createCustomerIssue(issueData: Partial<CustomerIssue>): Promise<CustomerIssue> {
    const { data } = await api.post<CustomerIssue>('/customer-issues', issueData);
    return data;
  },

  async updateCustomerIssue(id: string, updates: Partial<CustomerIssue>): Promise<CustomerIssue> {
    const { data } = await api.patch<CustomerIssue>(`/customer-issues/${id}`, updates);
    return data;
  },

  async updateStatus(
    id: string,
    status: string,
    resolution_notes?: string
  ): Promise<CustomerIssue> {
    const { data } = await api.patch<CustomerIssue>(`/customer-issues/${id}/status`, {
      status,
      resolution_notes,
    });
    return data;
  },

  async exportToExcel(params?: { status?: string; created_by?: string }): Promise<Blob> {
    const { data } = await api.get('/customer-issues/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },

  async deleteCustomerIssue(id: string): Promise<void> {
    await api.delete(`/customer-issues/${id}`);
  },
};
