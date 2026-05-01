import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import { usersService } from '@/services/users.service';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/store/authStore';
import { Download, Search, Trash2, Plus, Eye } from 'lucide-react';
import { Lead } from '@/types';

export const LeadsPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [promoterFilter, setPromoterFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const { hasPermission } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', statusFilter, search, promoterFilter, dateFilter, monthFilter],
    queryFn: () => leadsService.getLeads({
      status: statusFilter,
      search,
      promoter_id: promoterFilter,
      date: dateFilter,
      month: monthFilter,
    }),
  });

  // Get unique promoters for filter (only if user can view all leads)
  const canViewAllLeads = hasPermission('leads:view_all') || hasPermission('*');
  const { data: users } = useQuery({
    queryKey: ['users-promoters'],
    queryFn: usersService.getUsers,
    enabled: canViewAllLeads,
  });

  const promoters = users?.filter((u: any) => u.role === 'promoter') || [];

  const exportMutation = useMutation({
    mutationFn: leadsService.exportToExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leadsService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason, opportunity_notes }: { id: string; status: string; rejection_reason?: string; opportunity_notes?: string }) =>
      leadsService.updateStatus(id, status, rejection_reason, opportunity_notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'rejected') {
      const rejection_reason = prompt('سبب الرفض:');
      if (!rejection_reason) return;
      updateStatusMutation.mutate({ id, status: newStatus, rejection_reason });
    } else if (newStatus === 'opportunity') {
      const opportunity_notes = prompt('ملاحظات الفرصة:');
      if (!opportunity_notes) return;
      updateStatusMutation.mutate({ id, status: newStatus, opportunity_notes });
    } else {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const handleExport = () => {
    exportMutation.mutate({ status: statusFilter });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      opportunity: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'قيد الانتظار',
      opportunity: 'فرصة',
      rejected: 'مرفوض',
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
            <h2 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة جميع الطلبات</p>
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
            {hasPermission('leads:create') && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                طلب جديد
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو رقم الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="opportunity">فرصة</option>
              <option value="rejected">مرفوض</option>
            </select>
            {canViewAllLeads && (
              <select
                value={promoterFilter}
                onChange={(e) => setPromoterFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع المروجين</option>
                {promoters.map((promoter: any) => (
                  <option key={promoter.id} value={promoter.id}>
                    {promoter.full_name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="فلتر حسب اليوم"
            />
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="فلتر حسب الشهر"
            />
          </div>
        </div>

        {/* Statistics Summary */}
        {promoterFilter && leads && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">إحصائيات المروج المحدد</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {leads.length} طلب
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">المروج</p>
                <p className="text-sm font-semibold text-blue-900">
                  {promoters.find((p: any) => p.id === promoterFilter)?.full_name || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : leads && leads.length > 0 ? (
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
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المروج
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
                  {leads.map((lead: Lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {lead.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lead.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {lead.address || '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {lead.promoter?.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingLead(lead)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(hasPermission('leads:approve') || hasPermission('leads:edit')) && lead.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(lead.id, 'opportunity')}
                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                قبول
                              </button>
                              <button
                                onClick={() => handleStatusChange(lead.id, 'rejected')}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                رفض
                              </button>
                            </>
                          )}
                          {hasPermission('leads:delete') && (
                            <button
                              onClick={() => handleDelete(lead.id)}
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
            <div className="p-8 text-center text-gray-500">لا توجد طلبات</div>
          )}
        </div>

        {/* Lead Form Modal */}
        {showForm && (
          <LeadForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
              setShowForm(false);
            }}
          />
        )}

        {/* Lead View Modal */}
        {viewingLead && (
          <LeadViewModal
            lead={viewingLead}
            onClose={() => setViewingLead(null)}
          />
        )}
      </div>
    </Layout>
  );
};

const LeadForm = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    notes: '',
    source: '',
    activity_type: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => leadsService.createLead(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">طلب جديد</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المصدر
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر المصدر</option>
              <option value="walk-in">زيارة مباشرة</option>
              <option value="referral">إحالة</option>
              <option value="cold-call">اتصال بارد</option>
              <option value="social-media">وسائل التواصل</option>
              <option value="website">الموقع الإلكتروني</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع النشاط *
            </label>
            <input
              type="text"
              required
              value={formData.activity_type}
              onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
              placeholder="مثال: مطعم، محل تجاري، صيدلية..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
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

          <div className="flex gap-3 pt-4 border-t flex-shrink-0 bg-white">
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

const LeadViewModal = ({ lead, onClose }: { lead: Lead; onClose: () => void }) => {
  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      'walk-in': 'زيارة مباشرة',
      'referral': 'إحالة',
      'cold-call': 'اتصال بارد',
      'social-media': 'وسائل التواصل',
      'website': 'الموقع الإلكتروني',
      'other': 'أخرى',
    };
    return labels[source] || source || '-';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      opportunity: 'فرصة',
      rejected: 'مرفوض',
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">تفاصيل الطلب</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">اسم العميل</p>
              <p className="font-semibold text-gray-900">{lead.customer_name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
              <p className="font-semibold text-gray-900">{lead.phone}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">العنوان</p>
              <p className="font-semibold text-gray-900">{lead.address || '-'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">نوع النشاط</p>
              <p className="font-semibold text-gray-900">{(lead as any).activity_type || '-'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">المصدر</p>
              <p className="font-semibold text-gray-900">{getSourceLabel(lead.source || '')}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">الحالة</p>
              <p className="font-semibold text-gray-900">{getStatusLabel(lead.status)}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">المروج</p>
              <p className="font-semibold text-gray-900">{lead.promoter?.full_name || '-'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
              <p className="font-semibold text-gray-900">
                {new Date(lead.created_at).toLocaleDateString('ar-IQ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {lead.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">ملاحظات</p>
              <p className="text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {lead.status === 'rejected' && lead.rejection_reason && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 mb-2">سبب الرفض</p>
              <p className="text-red-900 whitespace-pre-wrap">{lead.rejection_reason}</p>
            </div>
          )}

          {lead.status === 'opportunity' && lead.opportunity_notes && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-2">ملاحظات الفرصة</p>
              <p className="text-green-900 whitespace-pre-wrap">{lead.opportunity_notes}</p>
            </div>
          )}

          {lead.reviewed_by && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-2">تمت المراجعة بواسطة</p>
              <p className="text-blue-900">{(lead as any).reviewer?.full_name || '-'}</p>
              {lead.reviewed_at && (
                <p className="text-sm text-blue-700 mt-1">
                  {new Date(lead.reviewed_at).toLocaleDateString('ar-IQ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
