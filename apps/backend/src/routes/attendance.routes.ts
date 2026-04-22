import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.getAttendance);
router.get('/my-records', attendanceController.getMyRecords);
router.get('/export', attendanceController.exportToExcel);

export default router;
