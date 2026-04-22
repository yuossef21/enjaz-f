import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.login(email, password);

      logger.info(`User logged in: ${email}`);

      res.json(result);
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req: Request, res: Response) {
    res.json({ message: 'Logged out successfully' });
  },
};
