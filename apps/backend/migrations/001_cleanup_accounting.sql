-- Cleanup Accounting Module Tables
-- Run this BEFORE running 002_accounting_schema.sql

DROP TABLE IF EXISTS expense_claim_items CASCADE;
DROP TABLE IF EXISTS expense_claims CASCADE;
DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS invoice_lines CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employee_receipt_vouchers CASCADE;
DROP TABLE IF EXISTS receipt_vouchers CASCADE;
DROP TABLE IF EXISTS payment_vouchers CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
