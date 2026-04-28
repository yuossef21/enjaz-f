import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { Layout } from '@/components/layout/Layout';
import { Plus, Trash2, Key, Edit } from 'lucide-react';
import { User } from '@/types';

// قائمة كل الصلاحيات المتاحة في النظام
const ALL_PERMISSIONS = [
  { id: 'leads:view', label: 'عرض كل الطلبات', category: 'الطلبات' },
  { id: 'leads:view_all', label: 'عرض جميع الطلبات', category: 'الطلبات' },
  { id: 'leads:create', label: 'إضافة طلب جديد', category: 'الطلبات' },
  { id: 'leads:edit', label: 'تعديل الطلبات', category: 'الطلبات' },
  { id: 'leads:delete', label: 'حذف الطلبات', category: 'الطلبات' },
  { id: 'leads:approve', label: 'تغيير حالة الطلبات', category: 'الطلبات' },
  { id: 'leads:export', label: 'تصدير Excel للطلبات', category: 'الطلبات' },

  { id: 'customers:view', label: 'عرض العملاء', category: 'العملاء' },
  { id: 'customers:view_all', label: 'عرض جميع العملاء', category: 'العملاء' },
  { id: 'customers:create', label: 'إضافة عميل', category: 'العملاء' },
  { id: 'customers:edit', label: 'تعديل عميل', category: 'العملاء' },
  { id: 'customers:delete', label: 'حذف عميل', category: 'العملاء' },

  { id: 'invoices:view', label: 'عرض الفواتير', category: 'الفواتير' },
  { id: 'invoices:create', label: 'إنشاء فاتورة', category: 'الفواتير' },
  { id: 'invoices:edit', label: 'تعديل فاتورة', category: 'الفواتير' },
  { id: 'invoices:delete', label: 'حذف فاتورة', category: 'الفواتير' },

  { id: 'attendance:view', label: 'عرض سجل الحضور', category: 'الحضور' },
  { id: 'attendance:checkin', label: 'تسجيل حضور', category: 'الحضور' },
  { id: 'attendance:edit', label: 'تعديل سجل الحضور', category: 'الحضور' },
  { id: 'attendance:delete', label: 'حذف سجل الحضور', category: 'الحضور' },
  { id: 'attendance:export', label: 'تصدير Excel للحضور', category: 'الحضور' },

  { id: 'expenses:view', label: 'عرض المصروفات', category: 'المصروفات' },
  { id: 'expenses:create', label: 'إنشاء طلب مصروف', category: 'المصروفات' },
  { id: 'expenses:approve', label: 'الموافقة على المصروفات', category: 'المصروفات' },
  { id: 'expenses:pay', label: 'دفع المصروفات', category: 'المصروفات' },
  { id: 'expenses:delete', label: 'حذف المصروفات', category: 'المصروفات' },

  { id: 'vouchers:view', label: 'عرض السندات', category: 'السندات' },
  { id: 'vouchers:create', label: 'إنشاء سند', category: 'السندات' },
  { id: 'vouchers:edit', label: 'تعديل سند', category: 'السندات' },
  { id: 'vouchers:approve', label: 'الموافقة على السندات', category: 'السندات' },
  { id: 'vouchers:post', label: 'ترحيل السندات', category: 'السندات' },
  { id: 'vouchers:delete', label: 'حذف السندات', category: 'السندات' },

  { id: 'employees:view', label: 'عرض الموظفين', category: 'الموظفين' },
  { id: 'employees:create', label: 'إضافة موظف', category: 'الموظفين' },
  { id: 'employees:edit', label: 'تعديل موظف', category: 'الموظفين' },
  { id: 'employees:delete', label: 'حذف موظف', category: 'الموظفين' },

  { id: 'leave:view', label: 'عرض الإجازات', category: 'الإجازات' },
  { id: 'leave:create', label: 'إنشاء طلب إجازة', category: 'الإجازات' },
  { id: 'leave:edit', label: 'تعديل طلب إجازة', category: 'الإجازات' },
  { id: 'leave:approve', label: 'الموافقة على الإجازات', category: 'الإجازات' },
  { id: 'leave:delete', label: 'حذف طلب إجازة', category: 'الإجازات' },

  { id: 'payroll:view', label: 'عرض الرواتب', category: 'الرواتب' },
  { id: 'payroll:create', label: 'إنشاء سجل راتب', category: 'الرواتب' },
  { id: 'payroll:edit', label: 'تعديل سجل راتب', category: 'الرواتب' },
  { id: 'payroll:approve', label: 'الموافقة على الرواتب', category: 'الرواتب' },
  { id: 'payroll:pay', label: 'دفع الرواتب', category: 'الرواتب' },
  { id: 'payroll:delete', label: 'حذف سجل راتب', category: 'الرواتب' },

  { id: 'products:view', label: 'عرض المنتجات', category: 'المنتجات' },
  { id: 'products:create', label: 'إضافة منتج', category: 'المنتجات' },
  { id: 'products:edit', label: 'تعديل منتج', category: 'المنتجات' },
  { id: 'products:delete', label: 'حذف منتج', category: 'المنتجات' },

  { id: 'users:view', label: 'عرض المستخدمين', category: 'إدارة المستخدمين' },
  { id: 'users:create', label: 'إضافة مستخدم', category: 'إدارة المستخدمين' },
  { id: 'users:edit', label: 'تعديل مستخدم', category: 'إدارة المستخدمين' },
  { id: 'users:delete', label: 'حذف مستخدم', category: 'إدارة المستخدمين' },
  { id: 'users:manage', label: 'إدارة الصلاحيات', category: 'إدارة المستخدمين' },
];

export const UsersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      usersService.updateUser(id, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowPermissionsModal(false);
      setEditingUser(null);
    },
  });

  const handleEditPermissions = (user: User) => {
    setEditingUser(user);
    setSelectedPermissions(user.permissions || []);
    setShowPermissionsModal(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    if (editingUser) {
      updatePermissionsMutation.mutate({
        id: editingUser.id,
        permissions: selectedPermissions,
      });
    }
  };

  const groupPermissionsByCategory = () => {
    const grouped: Record<string, typeof ALL_PERMISSIONS> = {};
    ALL_PERMISSIONS.forEach((perm) => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      quality: 'bg-blue-100 text-blue-800',
      promoter: 'bg-green-100 text-green-800',
    };
    const labels = {
      admin: 'مدير',
      quality: 'جودة',
      promoter: 'مروج',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة جميع المستخدمين</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            مستخدم جديد
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الاسم الكامل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPermissions(user)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-md"
                            title="تخصيص صلاحيات"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const newPassword = prompt('أدخل كلمة المرور الجديدة:');
                              if (newPassword) {
                                usersService.resetPassword(user.id, newPassword);
                              }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="إعادة تعيين كلمة المرور"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">لا يوجد مستخدمون</div>
          )}
        </div>

        {/* Permissions Modal */}
        {showPermissionsModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  صلاحيات: {editingUser.full_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  اختر الصلاحيات الإضافية لهذا الموظف — تضاف فوق صلاحيات رتبته الأساسية
                </p>
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(groupPermissionsByCategory()).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">{category}</h4>
                    <div className="space-y-2">
                      {permissions.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                selectedPermissions.includes(perm.id)
                                  ? 'bg-orange-500'
                                  : 'bg-gray-300'
                              }`}
                            />
                            <span className="text-sm text-gray-700">{perm.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={updatePermissionsMutation.isPending}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {updatePermissionsMutation.isPending ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            user={editingUser}
            onClose={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['users'] });
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

const UserForm = ({
  user,
  onClose,
  onSuccess,
}: {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    full_name: user?.full_name || '',
    role: user?.role || 'promoter',
    is_active: user?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      user
        ? usersService.updateUser(user.id, data)
        : usersService.createUser(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {user ? 'تعديل مستخدم' : 'مستخدم جديد'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور *
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدور *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'quality' | 'promoter' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="promoter">مروج</option>
              <option value="quality">جودة</option>
              <option value="admin">مدير</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              نشط
            </label>
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
