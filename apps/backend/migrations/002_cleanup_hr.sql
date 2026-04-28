-- Cleanup HR & Payroll Module Tables
-- Run this BEFORE running 003_hr_payroll_schema.sql

DROP TABLE IF EXISTS advance_deductions CASCADE;
DROP TABLE IF EXISTS employee_advances CASCADE;
DROP TABLE IF EXISTS payslip_details CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payroll_runs CASCADE;
DROP TABLE IF EXISTS employee_salary_components CASCADE;
DROP TABLE IF EXISTS salary_components CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS employee_documents CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
