import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  LogOut,
  UserCircle,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  Calendar,
  Box,
  LogIn,
  Menu,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: todayAttendance } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: attendanceService.getTodayAttendance,
  });

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
    },
  });

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

  const handleCheckOut = () => {
    checkOutMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', permission: null },
    { to: '/leads', icon: FileText, label: 'الطلبات', permission: 'leads:view' },
    { to: '/customers', icon: UserCircle, label: 'العملاء', permission: 'customers:view' },
    { to: '/invoices', icon: Receipt, label: 'الفواتير', permission: 'invoices:view' },
    { to: '/expense-claims', icon: DollarSign, label: 'المصروفات', permission: 'expenses:view' },
    { to: '/payment-vouchers', icon: Package, label: 'سندات الصرف', permission: 'vouchers:view' },
    { to: '/receipt-vouchers', icon: Package, label: 'سندات القبض', permission: 'vouchers:view' },
    { to: '/employees', icon: Briefcase, label: 'الموظفين', permission: 'employees:view' },
    { to: '/leave-requests', icon: Calendar, label: 'الإجازات', permission: 'leave:view' },
    { to: '/payroll', icon: DollarSign, label: 'الرواتب', permission: 'payroll:view' },
    { to: '/products', icon: Box, label: 'المنتجات', permission: 'products:view' },
    { to: '/attendance', icon: Clock, label: 'الحضور', permission: 'attendance:view' },
    { to: '/users', icon: Users, label: 'المستخدمين', permission: 'users:view' },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true; // لوحة التحكم متاحة للجميع
    return hasPermission(item.permission);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-lg fixed right-0 top-0 h-full overflow-y-auto z-50 transition-transform duration-300 md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-600">نظام إنجاز</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {visibleNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.to
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Attendance Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleCheckIn}
            disabled={!!todayAttendance?.check_in || checkInMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            <LogIn className="w-5 h-5" />
            {checkInMutation.isPending ? 'جاري...' : 'تسجيل حضور'}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!todayAttendance?.check_in || !!todayAttendance?.check_out || checkOutMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            {checkOutMutation.isPending ? 'جاري...' : 'تسجيل انصراف'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="mr-0 md:mr-64 flex-1 w-full max-w-full overflow-x-hidden">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 md:px-8 py-4">
            <div className="flex justify-between items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mr-auto md:mr-0">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">خروج</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-4 md:p-8 w-full max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
