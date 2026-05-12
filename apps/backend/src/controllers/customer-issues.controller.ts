import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { customerIssuesService } from '../services/customer-issues.service.js';
import { logger } from '../utils/logger.js';

export const customerIssuesController = {
  async getCustomerIssues(req: AuthRequest, res: Response) {
    try {
      const { status, search, created_by, date, month } = req.query;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const userPermissions = req.user!.permissions || [];

      // Check if user has permission to view all issues
      const canViewAll = userPermissions.includes('*') || userPermissions.includes('customer_issues:view_all');

      const issues = await customerIssuesService.getCustomerIssues({
        status: status as string,
        search: search as string,
        createdBy: created_by as string,
        date: date as string,
        month: month as string,
        userId,
        role,
        canViewAll,
      });

      res.json(issues);
    } catch (error: any) {
      logger.error('Get customer issues error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerIssueById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const issue = await customerIssuesService.getCustomerIssueById(id);

      if (!issue) {
        res.status(404).json({ error: 'Customer issue not found' });
        return;
      }

      res.json(issue);
    } catch (error: any) {
      logger.error('Get customer issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createCustomerIssue(req: AuthRequest, res: Response) {
    try {
      const issueData = {
        ...req.body,
        created_by: req.user!.userId,
      };

      const issue = await customerIssuesService.createCustomerIssue(issueData);
      logger.info(`Customer issue created: ${issue.id} by ${req.user!.email}`);

      res.status(201).json(issue);
    } catch (error: any) {
      logger.error('Create customer issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateCustomerIssue(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const issue = await customerIssuesService.updateCustomerIssue(id, req.body);

      logger.info(`Customer issue updated: ${id} by ${req.user!.email}`);
      res.json(issue);
    } catch (error: any) {
      logger.error('Update customer issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, resolution_notes } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const issue = await customerIssuesService.updateStatus(
        id,
        status,
        req.user!.userId,
        resolution_notes
      );

      logger.info(`Customer issue status updated: ${id} to ${status} by ${req.user!.email}`);
      res.json(issue);
    } catch (error: any) {
      logger.error('Update status error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async exportToExcel(req: AuthRequest, res: Response) {
    try {
      const { status, created_by } = req.query;
      const userPermissions = req.user!.permissions || [];
      const canViewAll = userPermissions.includes('*') || userPermissions.includes('customer_issues:view_all');
      const userId = canViewAll ? undefined : req.user!.userId;

      const buffer = await customerIssuesService.exportToExcel({
        status: status as string,
        createdBy: created_by as string,
        userId,
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=customer-issues-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      logger.error('Export customer issues error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCustomerIssue(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await customerIssuesService.deleteCustomerIssue(id);

      logger.info(`Customer issue deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Customer issue deleted successfully' });
    } catch (error: any) {
      logger.error('Delete customer issue error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
