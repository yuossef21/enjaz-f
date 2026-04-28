import { supabase } from '../config/database.js';
import { Customer } from '../models/accounting-types.js';

export const customersService = {
  async getCustomers(filters?: {
    search?: string;
    customer_type?: string;
    is_active?: boolean;
    created_by?: string;
  }) {
    let query = supabase
      .from('customers')
      .select(`
        *,
        creator:created_by(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name_ar.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,customer_code.ilike.%${filters.search}%`);
    }

    if (filters?.customer_type) {
      query = query.eq('customer_type', filters.customer_type);
    }

    if (typeof filters?.is_active === 'boolean') {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createCustomer(customerData: Partial<Customer>) {
    // Generate customer code - get the last customer code and increment
    const { data: lastCustomer } = await supabase
      .from('customers')
      .select('customer_code')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastCustomer && lastCustomer.customer_code) {
      const lastNumber = parseInt(lastCustomer.customer_code.replace('CUST-', ''));
      nextNumber = lastNumber + 1;
    }

    const customerCode = `CUST-${String(nextNumber).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        customer_code: customerCode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getCustomerInvoices(customerId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('invoice_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCustomerBalance(customerId: string, amount: number) {
    const customer = await this.getCustomerById(customerId);
    const newBalance = (customer.current_balance || 0) + amount;

    const { data, error } = await supabase
      .from('customers')
      .update({
        current_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
