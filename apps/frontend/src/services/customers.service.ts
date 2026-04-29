import api from './api';
import { Customer } from '@/types';

export const customersService = {
  async getCustomers(params?: {
    search?: string;
    customer_type?: string;
    promoter_id?: string;
    is_active?: boolean;
    date?: string;
    month?: string;
  }): Promise<Customer[]> {
    const { data } = await api.get<Customer[]>('/customers', { params });
    return data;
  },

  async getCustomerById(id: string): Promise<Customer> {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const { data } = await api.post<Customer>('/customers', customerData);
    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data } = await api.patch<Customer>(`/customers/${id}`, updates);
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async getCustomerInvoices(customerId: string): Promise<any[]> {
    const { data } = await api.get(`/customers/${customerId}/invoices`);
    return data;
  },

  async exportCustomers(params?: {
    search?: string;
    customer_type?: string;
    promoter_id?: string;
    is_active?: boolean;
    date?: string;
    month?: string;
  }): Promise<any[]> {
    const { data } = await api.get('/customers/export', { params });
    return data;
  },
};
