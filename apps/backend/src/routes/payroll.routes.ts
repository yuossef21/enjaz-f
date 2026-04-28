import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', payrollController.getPayrollRecords);
router.get('/export', payrollController.exportToExcel);
router.post('/', requirePermission('payroll:create'), payrollController.createPayrollRecord);
router.get('/:id', payrollController.getPayrollRecordById);
router.patch('/:id', requirePermission('payroll:edit'), payrollController.updatePayrollRecord);
router.post('/:id/approve', requirePermission('payroll:approve'), payrollController.approvePayrollRecord);
router.post('/:id/pay', requirePermission('payroll:pay'), payrollController.markAsPaid);
router.delete('/:id', requirePermission('payroll:delete'), payrollController.deletePayrollRecord);

export default router;
