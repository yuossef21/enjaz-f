import { supabase } from '../config/database.js';
import { Lead } from '../models/types.js';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const leadsService = {
  async getLeads(filters: {
    status?: string;
    search?: string;
    promoterId?: string;
    date?: string;
    month?: string;
    userId: string;
    role: string;
    canViewAll?: boolean;
  }) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        promoter:users!leads_promoter_id_fkey(id, full_name, email),
        reviewer:users!leads_reviewed_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    // المروجين يشوفون بس طلباتهم (إلا إذا عندهم صلاحية عرض الكل)
    if (filters.role === 'promoter' && !filters.canViewAll) {
      query = query.eq('promoter_id', filters.userId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.promoterId) {
      query = query.eq('promoter_id', filters.promoterId);
    }

    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    // Filter by specific date (takes priority over month filter)
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString());
    }
    // Filter by month (format: YYYY-MM) - only if date filter is not set
    else if (filters.month) {
      const [year, month] = filters.month.split('-');
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      query = query.gte('created_at', startOfMonth.toISOString()).lte('created_at', endOfMonth.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getLeadById(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        promoter:users!leads_promoter_id_fkey(id, full_name, email),
        reviewer:users!leads_reviewed_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createLead(leadData: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateStatus(
    id: string,
    status: string,
    reviewedBy: string,
    rejectionReason?: string,
    opportunityNotes?: string
  ) {
    const updates: any = {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (status === 'rejected' && rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }

    if (status === 'opportunity' && opportunityNotes) {
      updates.opportunity_notes = opportunityNotes;
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getStats(userId?: string) {
    let query = supabase.from('leads').select('status');

    if (userId) {
      query = query.eq('promoter_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      total: data.length,
      pending: data.filter((l) => l.status === 'pending').length,
      opportunity: data.filter((l) => l.status === 'opportunity').length,
      rejected: data.filter((l) => l.status === 'rejected').length,
    };

    return stats;
  },

  async exportToExcel(filters: { status?: string; userId?: string }) {
    const leads = await this.getLeads({
      status: filters.status,
      userId: filters.userId || '',
      role: filters.userId ? 'promoter' : 'admin',
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    worksheet.columns = [
      { header: 'اسم العميل', key: 'customer_name', width: 20 },
      { header: 'رقم الهاتف', key: 'phone', width: 15 },
      { header: 'العنوان', key: 'address', width: 30 },
      { header: 'الحالة', key: 'status', width: 15 },
      { header: 'المصدر', key: 'source', width: 15 },
      { header: 'المروج', key: 'promoter', width: 20 },
      { header: 'تاريخ الإنشاء', key: 'created_at', width: 20 },
      { header: 'ملاحظات', key: 'notes', width: 30 },
    ];

    leads.forEach((lead: any) => {
      worksheet.addRow({
        customer_name: lead.customer_name,
        phone: lead.phone,
        address: lead.address || '',
        status: lead.status,
        source: lead.source || '',
        promoter: lead.promoter?.full_name || '',
        created_at: formatInTimeZone(
          new Date(lead.created_at),
          'Asia/Baghdad',
          'yyyy-MM-dd HH:mm:ss'
        ),
        notes: lead.notes || '',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },

  async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
