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
