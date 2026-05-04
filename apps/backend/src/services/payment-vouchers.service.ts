import { supabase } from '../config/database.js';
import { PaymentVoucher } from '../models/accounting-types.js';

export const paymentVouchersService = {
  async getPaymentVouchers(filters?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    let query = supabase
      .from('payment_vouchers')
      .select(`
        *,
        account:accounts(id, code, name_ar),
        creator:users!payment_vouchers_created_by_fkey(id, full_name, email),
        approver:users!payment_vouchers_approved_by_fkey(id, full_name, email)
      `)
      .order('voucher_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.start_date) {
      query = query.gte('voucher_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('voucher_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getPaymentVoucherById(id: string) {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .select(`
        *,
        account:accounts(id, code, name_ar),
        creator:users!payment_vouchers_created_by_fkey(id, full_name, email),
        approver:users!payment_vouchers_approved_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createPaymentVoucher(voucherData: Partial<PaymentVoucher>) {
    // Generate voucher number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('payment_vouchers')
      .select('*', { count: 'exact', head: true })
      .like('voucher_number', `PV-${year}-%`);

    const voucherNumber = `PV-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

    // Clean up empty string values for UUID fields
    const cleanedData: any = { ...voucherData };
    if (cleanedData.account_id === '') delete cleanedData.account_id;
    if (cleanedData.employee_id === '') delete cleanedData.employee_id;

    const { data, error } = await supabase
      .from('payment_vouchers')
      .insert({
        ...cleanedData,
        voucher_number: voucherNumber,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updatePaymentVoucher(id: string, updates: Partial<PaymentVoucher>) {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async approvePaymentVoucher(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async postPaymentVoucher(id: string) {
    const { data, error } = await supabase
      .from('payment_vouchers')
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deletePaymentVoucher(id: string) {
    const { error } = await supabase
      .from('payment_vouchers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
