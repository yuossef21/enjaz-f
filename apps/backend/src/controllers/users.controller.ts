import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { usersService } from '../services/users.service.js';
import { logger } from '../utils/logger.js';

export const usersController = {
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await usersService.getUsers();
      res.json(users);
    } catch (error: any) {
      logger.error('Get users error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await usersService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error: any) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createUser(req: AuthRequest, res: Response) {
    try {
      const { email, password, full_name, role, permissions } = req.body;

      if (!email || !password || !full_name || !role) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await usersService.createUser({
        email,
        password,
        full_name,
        role,
        permissions,
      });

      logger.info(`User created: ${email} by ${req.user!.email}`);
      res.status(201).json(user);
    } catch (error: any) {
      logger.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await usersService.updateUser(id, updates);

      logger.info(`User updated: ${id} by ${req.user!.email}`);
      res.json(user);
    } catch (error: any) {
      logger.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (id === req.user!.userId) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
      }

      await usersService.deleteUser(id);

      logger.info(`User deleted: ${id} by ${req.user!.email}`);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      logger.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async resetPassword(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      if (!new_password) {
        res.status(400).json({ error: 'New password is required' });
        return;
      }

      await usersService.resetPassword(id, new_password);

      logger.info(`Password reset for user: ${id} by ${req.user!.email}`);
      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      logger.error('Reset password error:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
