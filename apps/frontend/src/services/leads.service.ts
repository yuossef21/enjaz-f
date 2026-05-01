import api from './api';
import { Lead, LeadStats } from '@/types';

export const leadsService = {
  async getLeads(params?: {
    status?: string;
    search?: string;
    promoter_id?: string;
    date?: string;
    month?: string;
  }): Promise<Lead[]> {
    const { data } = await api.get<Lead[]>('/leads', { params });
    return data;
  },

  async getLeadById(id: string): Promise<Lead> {
    const { data } = await api.get<Lead>(`/leads/${id}`);
    return data;
  },

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const { data } = await api.post<Lead>('/leads', leadData);
    return data;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data } = await api.patch<Lead>(`/leads/${id}`, updates);
    return data;
  },

  async updateStatus(
    id: string,
    status: string,
    rejection_reason?: string,
    opportunity_notes?: string
  ): Promise<Lead> {
    const { data } = await api.patch<Lead>(`/leads/${id}/status`, {
      status,
      rejection_reason,
      opportunity_notes,
    });
    return data;
  },

  async getStats(): Promise<LeadStats> {
    const { data } = await api.get<LeadStats>('/leads/stats');
    return data;
  },

  async exportToExcel(params?: { status?: string }): Promise<Blob> {
    const { data } = await api.get('/leads/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },

  async deleteLead(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
  },
};
