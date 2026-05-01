import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { leadsService } from '../services/leads.service.js';
import { logger } from '../utils/logger.js';

export const leadsController = {
  async getLeads(req: AuthRequest, res: Response) {
    try {
      const { status, search, promoter_id, date, month } = req.query;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const userPermissions = req.user!.permissions || [];

      // Check if user has permission to view all leads
      const canViewAll = userPermissions.includes('*') || userPermissions.includes('leads:view_all');

      const leads = await leadsService.getLeads({
        status: status as string,
        search: search as string,
        promoterId: promoter_id as string,
        date: date as string,
        month: month as string,
        userId,
        role,
        canViewAll,
      });

      res.json(leads);
    } catch (error: any) {
      logger.error('Get leads error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getLeadById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const lead = await leadsService.getLeadById(id);

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.json(lead);
    } catch (error: any) {
      logger.error('Get lead error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createLead(req: AuthRequest, res: Response) {
    try {
      const leadData = {
        ...req.body,
        promoter_id: req.user!.userId,
      };

      const lead = await leadsService.createLead(leadData);
      logger.info(`Lead created: ${lead.id} by ${req.user!.email}`);

      res.status(201).json(lead);
    } catch (error: any) {
      logger.error('Create lead error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateLead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const lead = await leadsService.updateLead(id, req.body);

      logger.info(`Lead updated: ${id} by ${req.user!.email}`);
      res.json(lead);
    } catch (error: any) {
      logger.error('Update lead error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejection_reason, opportunity_notes } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const lead = await leadsService.updateStatus(
        id,
        status,
        req.user!.userId,
        rejection_reason,
        opportunity_notes
      );

      logger.info(`Lead status updated: ${id} to ${status} by ${req.user!.email}`);
      res.json(lead);
    } catch (error: any) {
      logger.error('Update status error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.role === 'promoter' ? req.user!.userId : undefined;
      const stats = await leadsService.getStats(userId);

      res.json(stats);
    } catch (error: any) {
      logger.error('Get stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async exportToExcel(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const userId = req.user!.role === 'promoter' ? req.user!.userId : undefined;

      const buffer = await leadsService.exportToExcel({
        status: status as string,
        userId,
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      logger.error('Export leads error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteLead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await leadsService.deleteLead(id);

      logger.info(`Lead deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'Lead deleted successfully' });
    } catch (error: any) {
      logger.error('Delete lead error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
