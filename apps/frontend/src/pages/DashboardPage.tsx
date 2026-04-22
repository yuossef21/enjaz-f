import { useQuery } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import { Layout } from '@/components/layout/Layout';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: leadsService.getStats,
  });

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats?.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'قيد الانتظار',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'فرص',
      value: stats?.opportunity || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'مرفوض',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لوحة التحكم</h2>
          <p className="text-gray-600 mt-1">نظرة عامة على النظام</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            مرحباً بك في نظام إنجاز
          </h3>
          <p className="text-gray-600">
            نظام إدارة شامل للفرق الميدانية وضمان الجودة والمحاسبة والإدارة التنفيذية
          </p>
        </div>
      </div>
    </Layout>
  );
};
