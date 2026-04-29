import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { customersService } from '../services/customers.service.js';
import { logger } from '../utils/logger.js';

export const customersController = {
  async getCustomers(req: AuthRequest, res: Response) {
    try {
      const { search, customer_type, is_active, promoter_id, date, month } = req.query;
      const userId = req.user!.userId;
      const userPermissions = req.user!.permissions || [];

      // Check if user has permission to view all customers
      const canViewAll = userPermissions.includes('*') || userPermissions.includes('customers:view_all');

      const customers = await customersService.getCustomers({
        search: search as string,
        customer_type: customer_type as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
        created_by: promoter_id ? (promoter_id as string) : (canViewAll ? undefined : userId),
        date: date as string,
        month: month as string,
      });

      res.json(customers);
    } catch (error: any) {
      logger.error('Get customers error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customersService.getCustomerById(id);

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error: any) {
      logger.error('Get customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createCustomer(req: AuthRequest, res: Response) {
    try {
      const customer = await customersService.createCustomer({
        ...req.body,
        created_by: req.user!.userId,
      });
      logger.info(`Customer created: ${customer.id} by ${req.user!.email}`);

      res.status(201).json(customer);
    } catch (error: any) {
      logger.error('Create customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customersService.updateCustomer(id, req.body);

      logger.info(`Customer updated: ${id} by ${req.user!.email}`);
      res.json(customer);
    } catch (error: any) {
      logger.error('Update customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await customersService.deleteCustomer(id);

      logger.info(`Customer deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      logger.error('Delete customer error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerInvoices(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const invoices = await customersService.getCustomerInvoices(id);

      res.json(invoices);
    } catch (error: any) {
      logger.error('Get customer invoices error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async exportCustomers(req: AuthRequest, res: Response) {
    try {
      const { search, customer_type, is_active, promoter_id, date, month } = req.query;
      const userId = req.user!.userId;
      const userPermissions = req.user!.permissions || [];

      // Check if user has permission to view all customers
      const canViewAll = userPermissions.includes('*') || userPermissions.includes('customers:view_all');

      const customers = await customersService.getCustomers({
        search: search as string,
        customer_type: customer_type as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
        created_by: promoter_id ? (promoter_id as string) : (canViewAll ? undefined : userId),
        date: date as string,
        month: month as string,
      });

      const excelData = customers.map((customer: any) => ({
        'رمز العميل': customer.customer_code,
        'الاسم': customer.name_ar,
        'النوع': customer.customer_type === 'individual' ? 'فرد' : 'شركة',
        'الهاتف': customer.phone || '-',
        'البريد الإلكتروني': customer.email || '-',
        'العنوان': customer.address || '-',
        'الرصيد الحالي': customer.current_balance || 0,
        'حد الائتمان': customer.credit_limit || 0,
        'المروج': customer.creator?.full_name || '-',
        'الحالة': customer.status === 'active' ? 'نشط' : 'غير نشط',
        'تاريخ الإنشاء': new Date(customer.created_at).toLocaleDateString('ar-IQ'),
      }));

      res.json(excelData);
    } catch (error: any) {
      logger.error('Export customers error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
