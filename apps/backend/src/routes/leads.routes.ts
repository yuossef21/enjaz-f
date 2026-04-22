import { Router } from 'express';
import { leadsController } from '../controllers/leads.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', leadsController.getLeads);
router.post('/', requirePermission('leads:create'), leadsController.createLead);
router.get('/stats', leadsController.getStats);
router.get('/export', leadsController.exportToExcel);
router.get('/:id', leadsController.getLeadById);
router.patch('/:id', leadsController.updateLead);
router.patch('/:id/status', requirePermission('leads:approve'), leadsController.updateStatus);

export default router;
