import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { customerIssuesController } from '../controllers/customer-issues.controller.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['customer_issues:view', 'customer_issues:view_all', '*']),
  customerIssuesController.getCustomerIssues
);

router.get(
  '/export',
  authenticate,
  authorize(['customer_issues:export', '*']),
  customerIssuesController.exportToExcel
);

router.get(
  '/:id',
  authenticate,
  authorize(['customer_issues:view', 'customer_issues:view_all', '*']),
  customerIssuesController.getCustomerIssueById
);

router.post(
  '/',
  authenticate,
  authorize(['customer_issues:create', '*']),
  customerIssuesController.createCustomerIssue
);

router.patch(
  '/:id',
  authenticate,
  authorize(['customer_issues:update', '*']),
  customerIssuesController.updateCustomerIssue
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['customer_issues:resolve', '*']),
  customerIssuesController.updateStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize(['customer_issues:delete', '*']),
  customerIssuesController.deleteCustomerIssue
);

export default router;
