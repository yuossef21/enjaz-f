-- Insert default users for login
-- Run this if you need to recreate the default users

-- Delete existing default users first (if they exist)
DELETE FROM users WHERE email IN ('admin@enjaz.com', 'quality@enjaz.com', 'promoter@enjaz.com');

-- Create default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, permissions)
VALUES (
  'admin@enjaz.com',
  '$2b$10$rwcne5IFHKYrDPR0WDJrv..vXNOrI7.o9nRtAFZddEEtg9S.IWUqu',
  'System Administrator',
  'admin',
  '["*"]'::jsonb
);

-- Create sample quality user (password: quality123)
INSERT INTO users (email, password_hash, full_name, role, permissions)
VALUES (
  'quality@enjaz.com',
  '$2b$10$rllscM6PZ7Jo3CaZCd3g9.HDWZFFQHYxQiTYL5MBijJ4ZZnWc3gzO',
  'Quality Manager',
  'quality',
  '["*"]'::jsonb
);

-- Create sample promoter user (password: promoter123)
INSERT INTO users (email, password_hash, full_name, role, permissions)
VALUES (
  'promoter@enjaz.com',
  '$2b$10$qFm8DgNT8urolIRqxLJyweZV56V0DDrM0qPndJo.cmumhHVjD0C8q',
  'Field Promoter',
  'promoter',
  '["*"]'::jsonb
);
