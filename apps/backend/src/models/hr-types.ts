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
}
