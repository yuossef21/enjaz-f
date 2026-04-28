import { supabase } from '../config/database.js';
import { PayrollRecord } from '../models/hr-types.js';
import ExcelJS from 'exceljs';
import { formatInTimeZone } from 'date-fns-tz';

export const payrollService = {
  async getPayrollRecords(filters?: {
    employee_id?: string;
    month?: string;
    year?: number;
    status?: string;
  }) {
    let query = supabase
      .from('payroll')
      .select('*, employee_id')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }

    if (filters?.month) {
      query = query.eq('month', parseInt(filters.month));
    }

    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Fetch employee details separately
    if (data && data.length > 0) {
      const employeeIds = [...new Set(data.map(r => r.employee_id))];
      const { data: employees } = await supabase
        .from('employees')
        .select('id, employee_code, full_name, position, department')
        .in('id', employeeIds);

      // Attach employee data to each record
      return data.map(record => ({
        ...record,
        employee: employees?.find(e => e.id === record.employee_id)
      }));
    }

    return data;
  },

  async getPayrollRecordById(id: string) {
    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Fetch employee details
    if (data && data.employee_id) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id, employee_code, full_name, position, department')
        .eq('id', data.employee_id)
        .single();

      return {
        ...data,
        employee
      };
    }

    return data;
  },

  async createPayrollRecord(recordData: Partial<PayrollRecord>) {
    const netSalary =
      (recordData.base_salary || 0) +
      (recordData.bonuses || 0) -
      (recordData.deductions || 0);

    const { data, error } = await supabase
      .from('payroll')
      .insert({
        ...recordData,
        net_salary: netSalary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updatePayrollRecord(id: string, updates: Partial<PayrollRecord>) {
    if (updates.base_salary || updates.bonuses || updates.deductions) {
      const current = await this.getPayrollRecordById(id);
      const netSalary =
        (updates.base_salary ?? current.base_salary) +
        (updates.bonuses ?? current.bonuses) -
        (updates.deductions ?? current.deductions);
      updates.net_salary = netSalary;
    }

    const { data, error } = await supabase
      .from('payroll')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async approvePayrollRecord(id: string) {
    const { data, error } = await supabase
      .from('payroll')
      .update({
        status: 'approved',
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

  async markAsPaid(id: string) {
    const { data, error } = await supabase
      .from('payroll')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
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

  async deletePayrollRecord(id: string) {
    const { error } = await supabase
      .from('payroll')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async exportToExcel(filters?: { status?: string; year?: number }) {
    const records = await this.getPayrollRecords({
      status: filters?.status,
      year: filters?.year,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('الرواتب');

    worksheet.columns = [
      { header: 'اسم الموظف', key: 'employee_name', width: 25 },
      { header: 'المنصب', key: 'position', width: 20 },
      { header: 'القسم', key: 'department', width: 20 },
      { header: 'الشهر/السنة', key: 'month_year', width: 15 },
      { header: 'الراتب الأساسي', key: 'base_salary', width: 15 },
      { header: 'البدلات', key: 'bonuses', width: 15 },
      { header: 'الخصومات', key: 'deductions', width: 15 },
      { header: 'الصافي', key: 'net_salary', width: 15 },
      { header: 'الحالة', key: 'status', width: 12 },
      { header: 'تاريخ الدفع', key: 'payment_date', width: 20 },
    ];

    records.forEach((record: any) => {
      const monthNames = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const monthName = monthNames[parseInt(record.month)];

      worksheet.addRow({
        employee_name: record.employee?.full_name || '-',
        position: record.employee?.position || '-',
        department: record.employee?.department || '-',
        month_year: `${monthName} ${record.year}`,
        base_salary: record.base_salary,
        bonuses: record.bonuses,
        deductions: record.deductions,
        net_salary: record.net_salary,
        status: record.status === 'paid' ? 'مدفوع' : record.status === 'approved' ? 'موافق عليه' : 'مسودة',
        payment_date: record.payment_date ? formatInTimeZone(new Date(record.payment_date), 'Asia/Baghdad', 'yyyy-MM-dd HH:mm:ss') : '-',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};
