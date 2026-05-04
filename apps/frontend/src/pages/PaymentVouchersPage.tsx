import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentVouchersService } from '@/services/payment-vouchers.service';
import { employeesService } from '@/services/employees.service';
import { Layout } from '@/components/layout/Layout';
import { Plus, Check, Send, Trash2, Printer, Edit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PaymentVoucherPrint } from '@/components/payment-vouchers/PaymentVoucherPrint';

export const PaymentVouchersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [printVoucherId, setPrintVoucherId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['payment-vouchers', statusFilter],
    queryFn: () => paymentVouchersService.getPaymentVouchers({ status: statusFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: paymentVouchersService.approvePaymentVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
    },
  });

  const postMutation = useMutation({
    mutationFn: paymentVouchersService.postPaymentVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: paymentVouchersService.deletePaymentVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
    },
  });

  const handleApprove = (id: string) => {
    if (confirm('هل أنت متأكد من الموافقة على هذا السند؟')) {
      approveMutation.mutate(id);
    }
  };

  const handlePost = (id: string) => {
    if (confirm('هل أنت متأكد من ترحيل هذا السند؟')) {
      postMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السند؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (voucher: any) => {
    setEditingVoucher(voucher);
    setShowForm(true);
  };

  const handlePrint = (id: string) => {
    setPrintVoucherId(id);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      posted: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      draft: 'مسودة',
      approved: 'موافق عليه',
      posted: 'مرحل',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      check: 'شيك',
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">سندات الصرف</h2>
            <p className="text-gray-600 mt-1">إدارة سندات الصرف والمدفوعات</p>
          </div>
          {hasPermission('vouchers:create') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              سند صرف جديد
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="approved">موافق عليه</option>
            <option value="posted">مرحل</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : vouchers && vouchers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رقم السند
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحساب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      طريقة الدفع
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
                  {vouchers.map((voucher: any) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {voucher.voucher_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(voucher.voucher_date).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {voucher.account?.name_ar || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {voucher.amount?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getPaymentMethodLabel(voucher.payment_method)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(voucher.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePrint(voucher.id)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="طباعة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {hasPermission('vouchers:update') && voucher.status === 'draft' && (
                            <button
                              onClick={() => handleEdit(voucher)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('vouchers:approve') && voucher.status === 'draft' && (
                            <button
                              onClick={() => handleApprove(voucher.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="موافقة"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('vouchers:post') && voucher.status === 'approved' && (
                            <button
                              onClick={() => handlePost(voucher.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="ترحيل"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('vouchers:delete') && voucher.status === 'draft' && (
                            <button
                              onClick={() => handleDelete(voucher.id)}
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
            <div className="p-8 text-center text-gray-500">لا توجد سندات صرف</div>
          )}
        </div>

        {showForm && (
          <PaymentVoucherForm
            voucher={editingVoucher}
            onClose={() => {
              setShowForm(false);
              setEditingVoucher(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
              setShowForm(false);
              setEditingVoucher(null);
            }}
          />
        )}

        {printVoucherId && (
          <PaymentVoucherPrint
            voucherId={printVoucherId}
            onClose={() => setPrintVoucherId(null)}
          />
        )}
      </div>
    </Layout>
  );
};

const PaymentVoucherForm = ({
  voucher,
  onClose,
  onSuccess,
}: {
  voucher?: any;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    voucher_date: voucher?.voucher_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    account_id: voucher?.account_id || '',
    employee_id: voucher?.employee_id || '',
    amount: voucher?.amount || 0,
    payment_method: voucher?.payment_method || 'cash',
    reference_number: voucher?.reference_number || '',
    description: voucher?.description || '',
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getEmployees({ status: 'active' }),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (voucher) {
        return paymentVouchersService.updatePaymentVoucher(voucher.id, data);
      }
      return paymentVouchersService.createPaymentVoucher(data);
    },
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
            {voucher ? 'تعديل سند الصرف' : 'سند صرف جديد'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ السند *
              </label>
              <input
                type="date"
                required
                value={formData.voucher_date}
                onChange={(e) => setFormData({ ...formData, voucher_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الموظف *
            </label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر الموظف</option>
              {employees?.map((employee: any) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name} - {employee.employee_code}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع *
              </label>
              <select
                required
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">نقدي</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم المرجع
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
