import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { payrollService } from '../services/payroll.service.js';
import { logger } from '../utils/logger.js';

export const payrollController = {
  async getPayrollRecords(req: AuthRequest, res: Response) {
    try {
      const { employee_id, month, year, status } = req.query;

      const records = await payrollService.getPayrollRecords({
        employee_id: employee_id as string,
        month: month as string,
        year: year ? Number(year) : undefined,
        status: status as string,
      });

      res.json(records);
    } catch (error: any) {
      logger.error('Get payroll records error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getPayrollRecordById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const record = await payrollService.getPayrollRecordById(id);

      if (!record) {
        res.status(404).json({ error: 'Payroll record not found' });
        return;
      }

      res.json(record);
    } catch (error: any) {
      logger.error('Get payroll record error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createPayrollRecord(req: AuthRequest, res: Response) {
    try {
      const recordData = req.body;

      const record = await payrollService.createPayrollRecord(recordData);

      logger.info(`Payroll record created: ${record.id} by ${req.user!.email}`);
      res.status(201).json(record);
    } catch (error: any) {
      logger.error('Create payroll record error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updatePayrollRecord(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const record = await payrollService.updatePayrollRecord(id, updates);

      logger.info(`Payroll record updated: ${id} by ${req.user!.email}`);
      res.json(record);
    } catch (error: any) {
      logger.error('Update payroll record error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async approvePayrollRecord(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const record = await payrollService.approvePayrollRecord(id);

      logger.info(`Payroll record approved: ${id} by ${req.user!.email}`);
      res.json(record);
    } catch (error: any) {
      logger.error('Approve payroll record error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async markAsPaid(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const record = await payrollService.markAsPaid(id);

      logger.info(`Payroll record marked as paid: ${id} by ${req.user!.email}`);
      res.json(record);
    } catch (error: any) {
      logger.error('Mark as paid error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deletePayrollRecord(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await payrollService.deletePayrollRecord(id);

      logger.info(`Payroll record deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Payroll record deleted successfully' });
    } catch (error: any) {
      logger.error('Delete payroll record error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async exportToExcel(req: AuthRequest, res: Response) {
    try {
      const { status, year } = req.query;

      const buffer = await payrollService.exportToExcel({
        status: status as string,
        year: year ? Number(year) : undefined,
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=payroll-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      logger.error('Export payroll error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
