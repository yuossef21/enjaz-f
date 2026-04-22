import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', usersController.getUsers);
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserById);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.post('/:id/reset-password', usersController.resetPassword);

export default router;
