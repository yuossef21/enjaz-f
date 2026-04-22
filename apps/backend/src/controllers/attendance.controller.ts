import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { attendanceService } from '../services/attendance.service.js';
import { logger } from '../utils/logger.js';

export const attendanceController = {
  async checkIn(req: AuthRequest, res: Response) {
    try {
      const { location_lat, location_lng, notes } = req.body;
      const userId = req.user!.userId;

      const attendance = await attendanceService.checkIn(userId, {
        location_lat,
        location_lng,
        notes,
      });

      logger.info(`User checked in: ${req.user!.email}`);
      res.status(201).json(attendance);
    } catch (error: any) {
      logger.error('Check-in error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async checkOut(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const attendance = await attendanceService.checkOut(userId);

      logger.info(`User checked out: ${req.user!.email}`);
      res.json(attendance);
    } catch (error: any) {
      logger.error('Check-out error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAttendance(req: AuthRequest, res: Response) {
    try {
      const { user_id, start_date, end_date } = req.query;
      const role = req.user!.role;
      const currentUserId = req.user!.userId;

      const userId = role === 'promoter' ? currentUserId : (user_id as string);

      const attendance = await attendanceService.getAttendance({
        userId,
        startDate: start_date as string,
        endDate: end_date as string,
      });

      res.json(attendance);
    } catch (error: any) {
      logger.error('Get attendance error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getMyRecords(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { start_date, end_date } = req.query;

      const attendance = await attendanceService.getAttendance({
        userId,
        startDate: start_date as string,
        endDate: end_date as string,
      });

      res.json(attendance);
    } catch (error: any) {
      logger.error('Get my records error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async exportToExcel(req: AuthRequest, res: Response) {
    try {
      const { user_id, start_date, end_date } = req.query;
      const role = req.user!.role;
      const currentUserId = req.user!.userId;

      const userId = role === 'promoter' ? currentUserId : (user_id as string);

      const buffer = await attendanceService.exportToExcel({
        userId,
        startDate: start_date as string,
        endDate: end_date as string,
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${Date.now()}.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      logger.error('Export attendance error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
