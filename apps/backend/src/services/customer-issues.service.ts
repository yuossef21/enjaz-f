import { supabase } from '../config/database.js';
import { CustomerIssue } from '../models/types.js';
import ExcelJS from 'exceljs';
import { formatInTimeZone } from 'date-fns-tz';

export const customerIssuesService = {
  async getCustomerIssues(filters: {
    status?: string;
    search?: string;
    createdBy?: string;
    date?: string;
    month?: string;
    userId: string;
    role: string;
    canViewAll?: boolean;
  }) {
    let query = supabase
      .from('customer_issues')
      .select(`
        *,
        creator:users!customer_issues_created_by_fkey(id, full_name, email),
        resolver:users!customer_issues_resolved_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    // Users without view_all permission see only their own issues
    if (!filters.canViewAll && filters.role !== 'admin') {
      query = query.eq('created_by', filters.userId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    // Filter by specific date
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString());
    }
    // Filter by month
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

  async getCustomerIssueById(id: string) {
    const { data, error } = await supabase
      .from('customer_issues')
      .select(`
        *,
        creator:users!customer_issues_created_by_fkey(id, full_name, email),
        resolver:users!customer_issues_resolved_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createCustomerIssue(issueData: Partial<CustomerIssue>) {
    const { data, error } = await supabase
      .from('customer_issues')
      .insert(issueData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCustomerIssue(id: string, updates: Partial<CustomerIssue>) {
    const { data, error } = await supabase
      .from('customer_issues')
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
    resolvedBy: string,
    resolutionNotes?: string
  ) {
    const updates: any = {
      status,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (resolutionNotes) {
      updates.resolution_notes = resolutionNotes;
    }

    const { data, error } = await supabase
      .from('customer_issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async exportToExcel(filters: { status?: string; createdBy?: string; userId?: string }) {
    const issues = await this.getCustomerIssues({
      status: filters.status,
      createdBy: filters.createdBy,
      userId: filters.userId || '',
      role: filters.userId ? 'user' : 'admin',
      canViewAll: true,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer Issues');

    worksheet.columns = [
      { header: 'اسم العميل', key: 'customer_name', width: 20 },
      { header: 'رقم الهاتف', key: 'phone', width: 15 },
      { header: 'وصف المشكلة', key: 'issue_description', width: 40 },
      { header: 'الحالة', key: 'status', width: 15 },
      { header: 'الموظف', key: 'creator', width: 20 },
      { header: 'تاريخ الإنشاء', key: 'created_at', width: 20 },
      { header: 'ملاحظات أولية', key: 'notes', width: 30 },
      { header: 'ملاحظات المراجعة', key: 'resolution_notes', width: 30 },
    ];

    issues.forEach((issue: any) => {
      worksheet.addRow({
        customer_name: issue.customer_name,
        phone: issue.phone,
        issue_description: issue.issue_description,
        status: issue.status,
        creator: issue.creator?.full_name || '',
        created_at: formatInTimeZone(
          new Date(issue.created_at),
          'Asia/Baghdad',
          'yyyy-MM-dd HH:mm:ss'
        ),
        notes: issue.notes || '',
        resolution_notes: issue.resolution_notes || '',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },

  async deleteCustomerIssue(id: string) {
    const { error } = await supabase
      .from('customer_issues')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
