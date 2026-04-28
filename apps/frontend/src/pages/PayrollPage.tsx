import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '@/services/payroll.service';
import { employeesService } from '@/services/employees.service';
import { Layout } from '@/components/layout/Layout';
import { Plus, Check, DollarSign, Trash2, Edit, Download, Printer } from 'lucide-react';
import { PayrollRecord } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { PayrollInvoicePrint } from '@/components/payroll/PayrollInvoicePrint';

export const PayrollPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState('');
  const [printingRecord, setPrintingRecord] = useState<any>(null);
  const queryClient = useQueryClient();
  const { hasPermission, user } = useAuthStore();

  // Debug logging
  console.log('PayrollPage - Current user:', user);
  console.log('PayrollPage - hasPermission function:', hasPermission);

  const { data: records, isLoading } = useQuery({
    queryKey: ['payroll', statusFilter, yearFilter, monthFilter],
    queryFn: () => payrollService.getPayrollRecords({
      status: statusFilter,
      year: yearFilter,
      month: monthFilter,
    }),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getEmployees({ status: 'active' }),
  });

  const approveMutation = useMutation({
    mutationFn: payrollService.approvePayrollRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const payMutation = useMutation({
    mutationFn: payrollService.markAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: payrollService.deletePayrollRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => payrollService.exportToExcel({
      status: statusFilter,
      year: yearFilter,
      month: monthFilter,
    }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-${yearFilter}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handlePrintInvoice = (record: any) => {
    setPrintingRecord({
      employee_name: record.employee?.full_name || '-',
      position: record.employee?.position,
      department: record.employee?.department,
      month: record.month,
      year: record.year,
      base_salary: record.base_salary,
      bonuses: record.bonuses,
      deductions: record.deductions,
      net_salary: record.net_salary,
      payment_date: record.payment_date,
    });
  };

  const handleEdit = (record: PayrollRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleApprove = (id: string) => {
    if (confirm('هل أنت متأكد من الموافقة على هذا السجل؟')) {
      approveMutation.mutate(id);
    }
  };

  const handlePay = (id: string) => {
    if (confirm('هل أنت متأكد من تسجيل الدفع؟')) {
      payMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      draft: 'مسودة',
      approved: 'موافق عليه',
      paid: 'مدفوع',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getMonthLabel = (month: string) => {
    const months = {
      '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
      '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
      '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
    };
    return months[month as keyof typeof months] || month;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الرواتب</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة سجلات الرواتب</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              تصدير Excel
            </button>
            {hasPermission('payroll:create') && (
              <button
                onClick={() => {
                  setEditingRecord(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                سجل راتب جديد
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="approved">موافق عليه</option>
              <option value="paid">مدفوع</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الأشهر</option>
              <option value="1">يناير</option>
              <option value="2">فبراير</option>
              <option value="3">مارس</option>
              <option value="4">أبريل</option>
              <option value="5">مايو</option>
              <option value="6">يونيو</option>
              <option value="7">يوليو</option>
              <option value="8">أغسطس</option>
              <option value="9">سبتمبر</option>
              <option value="10">أكتوبر</option>
              <option value="11">نوفمبر</option>
              <option value="12">ديسمبر</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : records && records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الموظف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الشهر/السنة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الراتب الأساسي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      البدلات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الخصومات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الصافي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.employee?.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getMonthLabel(record.month)} {record.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.base_salary?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600">
                        +{record.bonuses?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        -{record.deductions?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {record.net_salary?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(() => {
                            console.log('Record:', record.id, 'Status:', record.status);
                            console.log('hasPermission(payroll:edit):', hasPermission('payroll:edit'));
                            console.log('hasPermission(payroll:approve):', hasPermission('payroll:approve'));
                            console.log('hasPermission(payroll:pay):', hasPermission('payroll:pay'));
                            console.log('hasPermission(payroll:delete):', hasPermission('payroll:delete'));
                            return null;
                          })()}
                          {record.status === 'paid' && (
                            <button
                              onClick={() => handlePrintInvoice(record)}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="طباعة فاتورة"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('payroll:edit') && record.status === 'draft' && (
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('payroll:approve') && record.status === 'draft' && (
                            <button
                              onClick={() => handleApprove(record.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="موافقة"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('payroll:pay') && record.status === 'approved' && (
                            <button
                              onClick={() => handlePay(record.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="دفع"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('payroll:delete') && record.status === 'draft' && (
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">لا توجد سجلات رواتب</div>
          )}
        </div>

        {showForm && (
          <PayrollForm
            record={editingRecord}
            employees={employees || []}
            onClose={() => {
              setShowForm(false);
              setEditingRecord(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['payroll'] });
              setShowForm(false);
              setEditingRecord(null);
            }}
          />
        )}

        {printingRecord && (
          <PayrollInvoicePrint
            data={printingRecord}
            onClose={() => setPrintingRecord(null)}
          />
        )}
      </div>
    </Layout>
  );
};

const PayrollForm = ({
  record,
  employees,
  onClose,
  onSuccess,
}: {
  record: PayrollRecord | null;
  employees: any[];
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    employee_id: record?.employee_id || '',
    month: record?.month || new Date().toISOString().slice(5, 7),
    year: record?.year || new Date().getFullYear(),
    base_salary: record?.base_salary || 0,
    bonuses: record?.bonuses || 0,
    deductions: record?.deductions || 0,
    notes: record?.notes || '',
  });

  const netSalary = formData.base_salary + formData.bonuses - formData.deductions;

  const mutation = useMutation({
    mutationFn: (data: any) =>
      record
        ? payrollService.updatePayrollRecord(record.id, data)
        : payrollService.createPayrollRecord(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {record ? 'تعديل سجل الراتب' : 'سجل راتب جديد'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الموظف *
            </label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر الموظف</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} - {emp.employee_code}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الشهر *
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="01">يناير</option>
                <option value="02">فبراير</option>
                <option value="03">مارس</option>
                <option value="04">أبريل</option>
                <option value="05">مايو</option>
                <option value="06">يونيو</option>
                <option value="07">يوليو</option>
                <option value="08">أغسطس</option>
                <option value="09">سبتمبر</option>
                <option value="10">أكتوبر</option>
                <option value="11">نوفمبر</option>
                <option value="12">ديسمبر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السنة *
              </label>
              <input
                type="number"
                required
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الراتب الأساسي *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البدلات
              </label>
              <input
                type="number"
                min="0"
                value={formData.bonuses}
                onChange={(e) => setFormData({ ...formData, bonuses: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الخصومات
              </label>
              <input
                type="number"
                min="0"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">الراتب الصافي:</span>
              <span className="text-lg font-bold text-blue-600">
                {netSalary.toLocaleString('ar-IQ')} IQD
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
