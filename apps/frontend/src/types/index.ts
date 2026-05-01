export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'quality' | 'promoter';
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  address?: string;
  notes?: string;
  status: 'pending' | 'opportunity' | 'rejected';
  source?: string;
  promoter_id?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  opportunity_notes?: string;
  created_at: string;
  updated_at: string;
  promoter?: {
    id: string;
    full_name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface Attendance {
  id: string;
  user_id: string;
  check_in: string;
  check_out?: string;
  location_lat?: number;
  location_lng?: number;
  notes?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LeadStats {
  total: number;
  pending: number;
  opportunity: number;
  rejected: number;
}

export interface Customer {
  id: string;
  customer_code: string;
  name_ar: string;
  name_en?: string;
  customer_type: 'individual' | 'company';
  phone?: string;
  email?: string;
  address?: string;
  tax_number?: string;
  credit_limit?: number;
  current_balance?: number;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  lines?: InvoiceLine[];
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_rate: number;
  line_total: number;
}

export interface ExpenseClaim {
  id: string;
  claim_number: string;
  employee_id: string;
  claim_date: string;
  description?: string;
  total_amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
  items?: ExpenseClaimItem[];
}

export interface ExpenseClaimItem {
  id: string;
  claim_id: string;
  category: string;
  description: string;
  amount: number;
}

export interface PaymentVoucher {
  id: string;
  voucher_number: string;
  voucher_date: string;
  account_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'check';
  reference_number?: string;
  description?: string;
  status: 'draft' | 'approved' | 'posted';
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    code: string;
    name_ar: string;
  };
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
  approver?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface ReceiptVoucher {
  id: string;
  voucher_number: string;
  voucher_date: string;
  account_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'check';
  reference_number?: string;
  description?: string;
  status: 'draft' | 'approved' | 'posted';
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    code: string;
    name_ar: string;
  };
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
  approver?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  address?: string;
  department?: string;
  position?: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'unpaid' | 'emergency';
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  };
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  year: number;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  };
}

export interface Product {
  id: string;
  product_code: string;
  name_ar: string;
  name_en?: string;
  description?: string;
  category?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_level: number;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  warehouse_code: string;
  name_ar: string;
  name_en?: string;
  location?: string;
  manager_name?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reference_number?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface Supplier {
  id: string;
  supplier_code: string;
  name_ar: string;
  name_en?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}
