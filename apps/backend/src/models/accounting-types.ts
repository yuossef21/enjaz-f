export interface Account {
  id: string;
  code: string;
  name_ar: string;
  name_en?: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  is_active: boolean;
  opening_balance: number;
  current_balance: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentVoucher {
  id: string;
  voucher_number: string;
  voucher_date: string;
  amount: number;
  currency: string;
  paid_to: string;
  payment_method: 'cash' | 'bank_transfer' | 'check';
  account_id?: string;
  employee_id?: string;
  reference_number?: string;
  description?: string;
  status: 'draft' | 'approved' | 'posted' | 'cancelled';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  posted_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptVoucher {
  id: string;
  voucher_number: string;
  voucher_date: string;
  amount: number;
  currency: string;
  received_from: string;
  payment_method: 'cash' | 'bank_transfer' | 'cheque';
  account_id?: string;
  reference_number?: string;
  description?: string;
  status: 'draft' | 'approved' | 'posted' | 'cancelled';
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  posted_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  name_ar: string;
  name_en?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  id_number?: string;
  tax_number?: string;
  credit_limit: number;
  current_balance: number;
  customer_type: 'individual' | 'company';
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: 'sales' | 'proforma' | 'credit_note';
  invoice_date: string;
  due_date?: string;
  customer_id?: string;
  opportunity_id?: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  tax_amount: number;
  tax_percentage: number;
  total_amount: number;
  currency: string;
  payment_terms?: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paid_amount: number;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  product_id?: string;
  notes?: string;
  created_at: string;
}

export interface ExpenseClaim {
  id: string;
  claim_number: string;
  employee_id: string;
  claim_date: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseClaimItem {
  id: string;
  expense_claim_id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  receipt_image_url?: string;
  account_id?: string;
  notes?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  user_id?: string;
  employee_code: string;
  full_name_ar: string;
  full_name_en?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  phone?: string;
  email?: string;
  hire_date: string;
  position: string;
  department?: string;
  base_salary: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  request_number: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  id: string;
  run_number: string;
  period_month: number;
  period_year: number;
  start_date: string;
  end_date: string;
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled';
  calculated_at?: string;
  calculated_by?: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: string;
  payslip_number: string;
  payroll_run_id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  working_days: number;
  present_days: number;
  absent_days: number;
  base_salary: number;
  total_allowances: number;
  total_deductions: number;
  gross_salary: number;
  net_salary: number;
  payment_date?: string;
  status: 'draft' | 'approved' | 'paid';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_code: string;
  barcode?: string;
  name_ar: string;
  name_en?: string;
  category_id?: string;
  product_type: 'product' | 'service';
  unit_of_measure: string;
  cost_price: number;
  selling_price: number;
  currency: string;
  current_stock: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  movement_number: string;
  movement_date: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  product_id: string;
  warehouse_id?: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}
