import { supabase } from '../config/database.js';
import { Attendance } from '../models/types.js';
import ExcelJS from 'exceljs';
import { formatInTimeZone } from 'date-fns-tz';

const BAGHDAD_TZ = 'Asia/Baghdad';

export const attendanceService = {
  async checkIn(
    userId: string,
    data: { location_lat?: number; location_lng?: number; notes?: string }
  ) {
    // Check if user already has an open attendance record
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .is('check_out', null)
      .order('check_in', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      throw new Error('You already have an open check-in. Please check out first.');
    }

    const { data: attendance, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        check_in: new Date().toISOString(),
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return attendance;
  },

  async checkOut(userId: string) {
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .is('check_out', null)
      .order('check_in', { ascending: false })
      .limit(1)
      .single();

    if (!attendance) {
      throw new Error('No open check-in found. Please check in first.');
    }

    const { data: updated, error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', attendance.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updated;
  },

  async getAttendance(filters: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        user:users(id, full_name, email, role)
      `)
      .order('check_in', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.startDate) {
      query = query.gte('check_in', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('check_in', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async exportToExcel(filters: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const attendance = await this.getAttendance(filters);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
      { header: 'الموظف', key: 'user_name', width: 25 },
      { header: 'البريد الإلكتروني', key: 'email', width: 30 },
      { header: 'الدور', key: 'role', width: 15 },
      { header: 'تسجيل الدخول', key: 'check_in', width: 25 },
      { header: 'تسجيل الخروج', key: 'check_out', width: 25 },
      { header: 'ساعات العمل', key: 'hours', width: 15 },
      { header: 'ملاحظات', key: 'notes', width: 30 },
    ];

    attendance.forEach((record: any) => {
      const checkIn = new Date(record.check_in);
      const checkOut = record.check_out ? new Date(record.check_out) : null;

      let hours = '';
      if (checkOut) {
        const diff = checkOut.getTime() - checkIn.getTime();
        const hoursWorked = Math.floor(diff / (1000 * 60 * 60));
        const minutesWorked = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        hours = `${hoursWorked}:${minutesWorked.toString().padStart(2, '0')}`;
      }

      worksheet.addRow({
        user_name: record.user?.full_name || '',
        email: record.user?.email || '',
        role: record.user?.role || '',
        check_in: formatInTimeZone(checkIn, BAGHDAD_TZ, 'yyyy-MM-dd HH:mm:ss'),
        check_out: checkOut
          ? formatInTimeZone(checkOut, BAGHDAD_TZ, 'yyyy-MM-dd HH:mm:ss')
          : 'لم يسجل الخروج',
        hours,
        notes: record.notes || '',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};
