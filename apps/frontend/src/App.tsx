import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { UsersPage } from '@/pages/UsersPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerIssuesPage } from '@/pages/CustomerIssuesPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { ExpenseClaimsPage } from '@/pages/ExpenseClaimsPage';
import { PaymentVouchersPage } from '@/pages/PaymentVouchersPage';
import { ReceiptVouchersPage } from '@/pages/ReceiptVouchersPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { LeaveRequestsPage } from '@/pages/LeaveRequestsPage';
import { PayrollPage } from '@/pages/PayrollPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-issues"
            element={
              <ProtectedRoute>
                <CustomerIssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense-claims"
            element={
              <ProtectedRoute>
                <ExpenseClaimsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-vouchers"
            element={
              <ProtectedRoute>
                <PaymentVouchersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipt-vouchers"
            element={
              <ProtectedRoute>
                <ReceiptVouchersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-requests"
            element={
              <ProtectedRoute>
                <LeaveRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
