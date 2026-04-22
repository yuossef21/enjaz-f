import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import { Layout } from '@/components/layout/Layout';
import { Clock, Download, LogIn, LogOut } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

const BAGHDAD_TZ = 'Asia/Baghdad';

export const AttendancePage = () => {
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: attendanceService.getMyRecords,
  });

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: attendanceService.exportToExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const hasOpenCheckIn = records?.some((r) => !r.check_out);

  const handleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          checkInMutation.mutate({
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude,
          });
        },
        () => {
          checkInMutation.mutate({});
        }
      );
    } else {
      checkInMutation.mutate({});
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">الحضور والانصراف</h2>
            <p className="text-gray-600 mt-1">تسجيل الحضور اليومي</p>
          </div>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>
        </div>

        {/* Check In/Out Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleCheckIn}
              disabled={hasOpenCheckIn || checkInMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              تسجيل الحضور
            </button>
            <button
              onClick={() => checkOutMutation.mutate()}
              disabled={!hasOpenCheckIn || checkOutMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الانصراف
            </button>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">سجل الحضور</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : records && records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تسجيل الدخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تسجيل الخروج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      ساعات العمل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      ملاحظات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => {
                    const checkIn = new Date(record.check_in);
                    const checkOut = record.check_out ? new Date(record.check_out) : null;
                    let hours = '';
                    if (checkOut) {
                      const diff = checkOut.getTime() - checkIn.getTime();
                      const h = Math.floor(diff / (1000 * 60 * 60));
                      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      hours = `${h}:${m.toString().padStart(2, '0')}`;
                    }

                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatInTimeZone(checkIn, BAGHDAD_TZ, 'yyyy-MM-dd HH:mm:ss')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {checkOut
                            ? formatInTimeZone(checkOut, BAGHDAD_TZ, 'yyyy-MM-dd HH:mm:ss')
                            : 'لم يسجل الخروج'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{hours || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">لا توجد سجلات</div>
          )}
        </div>
      </div>
    </Layout>
  );
};
