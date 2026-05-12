import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerIssuesService } from '@/services/customer-issues.service';
import { usersService } from '@/services/users.service';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/store/authStore';
import { Download, Search, Trash2, Plus, Eye, Check, X } from 'lucide-react';
import { CustomerIssue } from '@/types';

export const CustomerIssuesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<CustomerIssue | null>(null);
  const { hasPermission } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery({
    queryKey: ['customer-issues', statusFilter, search, creatorFilter, dateFilter, monthFilter],
    queryFn: () => customerIssuesService.getCustomerIssues({
      status: statusFilter,
      search,
      created_by: creatorFilter,
      date: dateFilter,
      month: monthFilter,
    }),
  });

  // Get users who can create issues for filter
  const canViewAllIssues = hasPermission('customer_issues:view_all') || hasPermission('*');
  const { data: users } = useQuery({
    queryKey: ['users-creators'],
    queryFn: usersService.getUsers,
    enabled: canViewAllIssues,
  });

  const creators = users?.filter((u: any) =>
    u.permissions?.includes('customer_issues:create') || u.permissions?.includes('*')
  ) || [];

  const exportMutation = useMutation({
    mutationFn: customerIssuesService.exportToExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-issues-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerIssuesService.deleteCustomerIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-issues'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, resolution_notes }: { id: string; status: string; resolution_notes?: string }) =>
      customerIssuesService.updateStatus(id, status, resolution_notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-issues'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المشكلة؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'resolved' || newStatus === 'unresolved') {
      const resolution_notes = prompt('ملاحظات المراجعة:');
      if (resolution_notes !== null) {
        updateStatusMutation.mutate({ id, status: newStatus, resolution_notes });
      }
    } else {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const handleExport = () => {
    exportMutation.mutate({ status: statusFilter, created_by: creatorFilter });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      unresolved: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'قيد الانتظار',
      resolved: 'تم الحل',
      unresolved: 'لم يتم الحل',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مشاكل العملاء</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة مشاكل العملاء</p>
          </div>
          <div className="flex gap-3">
            {hasPermission('customer_issues:export') && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                تصدير Excel
              </button>
            )}
            {hasPermission('customer_issues:create') && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                مشكلة جديدة
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setMonthFilter('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="التاريخ"
            />
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setDateFilter('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="الشهر"
            />
            {canViewAllIssues && (
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع الموظفين</option>
                {creators.map((creator: any) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.full_name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="resolved">تم الحل</option>
              <option value="unresolved">لم يتم الحل</option>
            </select>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث بالاسم أو رقم الهاتف"
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : issues && issues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      اسم العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رقم الهاتف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المشكلة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الموظف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {issues.map((issue: CustomerIssue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {issue.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{issue.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {issue.issue_description}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(issue.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {issue.creator?.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(issue.created_at).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingIssue(issue)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="عرض"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission('customer_issues:resolve') && issue.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(issue.id, 'resolved')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="تم الحل"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(issue.id, 'unresolved')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="لم يتم الحل"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {hasPermission('customer_issues:delete') && (
                            <button
                              onClick={() => handleDelete(issue.id)}
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
            <div className="p-8 text-center text-gray-500">لا توجد مشاكل</div>
          )}
        </div>

        {showForm && (
          <CustomerIssueForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['customer-issues'] });
              setShowForm(false);
            }}
          />
        )}

        {viewingIssue && (
          <IssueViewModal issue={viewingIssue} onClose={() => setViewingIssue(null)} />
        )}
      </div>
    </Layout>
  );
};

const CustomerIssueForm = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    issue_description: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: customerIssuesService.createCustomerIssue,
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
          <h3 className="text-xl font-bold text-gray-900">مشكلة جديدة</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم العميل *
            </label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف المشكلة *
            </label>
            <textarea
              required
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات أولية
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

const IssueViewModal = ({
  issue,
  onClose,
}: {
  issue: CustomerIssue;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">تفاصيل المشكلة</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">اسم العميل</label>
            <p className="text-gray-900">{issue.customer_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">رقم الهاتف</label>
            <p className="text-gray-900">{issue.phone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">وصف المشكلة</label>
            <p className="text-gray-900 whitespace-pre-wrap">{issue.issue_description}</p>
          </div>

          {issue.notes && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-900 mb-1">ملاحظات أولية</label>
              <p className="text-blue-800 whitespace-pre-wrap">{issue.notes}</p>
            </div>
          )}

          {issue.resolution_notes && (
            <div className="bg-green-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-green-900 mb-1">ملاحظات المراجعة</label>
              <p className="text-green-800 whitespace-pre-wrap">{issue.resolution_notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">الموظف</label>
              <p className="text-gray-900">{issue.creator?.full_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">الحالة</label>
              <p className="text-gray-900">
                {issue.status === 'pending' && 'قيد الانتظار'}
                {issue.status === 'resolved' && 'تم الحل'}
                {issue.status === 'unresolved' && 'لم يتم الحل'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
