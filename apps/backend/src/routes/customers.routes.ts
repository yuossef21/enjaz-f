import { Router } from 'express';
import { customersController } from '../controllers/customers.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/export', customersController.exportCustomers);
router.get('/', customersController.getCustomers);
router.post('/', requirePermission('customers:create'), customersController.createCustomer);
router.get('/:id', customersController.getCustomerById);
router.patch('/:id', requirePermission('customers:edit'), customersController.updateCustomer);
router.delete('/:id', requirePermission('customers:delete'), customersController.deleteCustomer);
router.get('/:id/invoices', customersController.getCustomerInvoices);

export default router;
