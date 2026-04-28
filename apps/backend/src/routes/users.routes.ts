import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

// Allow quality and admin to view users (for filters)
router.get('/', requireRole('admin', 'quality'), usersController.getUsers);

// Only admin can modify users
router.use(requireRole('admin'));
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserById);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.post('/:id/reset-password', usersController.resetPassword);

export default router;
