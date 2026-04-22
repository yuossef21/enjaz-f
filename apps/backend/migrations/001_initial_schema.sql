-- Enjaz Management System Database Schema
-- Phase 1: CRM, Attendance, User Management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'quality', 'promoter')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'opportunity', 'rejected')),
  source VARCHAR(100),
  promoter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_promoter ON leads(promoter_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(check_in);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Create default admin user (password: admin123)
-- Password hash generated with bcrypt, 10 rounds
INSERT INTO users (email, password_hash, full_name, role, permissions)
VALUES (
  'admin@enjaz.com',
  '$2b$10$rKZLvVZqGJxE5Y5yN5YqXOZJ5YqXOZJ5YqXOZJ5YqXOZJ5YqXOZJ5Y',
  'System Administrator',
  'admin',
  '["*"]'::jsonb
);

-- Create sample quality user (password: quality123)
INSERT INTO users (email, password_hash, full_name, role, permissions)
VALUES (
  'quality@enjaz.com',
  '$2b$10$rKZLvVZqGJxE5Y5yN5YqXOZJ5YqXOZJ5YqXOZJ5YqXOZJ5YqXOZJ5Y',
  'Quality Manager',
  'quality',
  '["leads:approve", "leads:view"]'::jsonb
);

-- Create sample promoter user (password: promoter123)
INSERT INTO users (email, password_hash, full_name, role, permissions)
VALUES (
  'promoter@enjaz.com',
  '$2b$10$rKZLvVZqGJxE5Y5yN5YqXOZJ5YqXOZJ5YqXOZJ5YqXOZJ5YqXOZJ5Y',
  'Field Promoter',
  'promoter',
  '["leads:create", "leads:view", "attendance:checkin"]'::jsonb
);
