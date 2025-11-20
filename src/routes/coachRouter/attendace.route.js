import express from 'express';
import {
  markAttendance,
  bulkMarkAttendance,
  unmarkAttendance,
  getAttendanceReport,
  getTodaysAttendance
} from '../controllers/attendance.controller.js';
import { authenticate, updateActivity } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate, updateActivity);

// Attendance operations
router.post('/mark', markAttendance);
router.post('/bulk-mark', bulkMarkAttendance);
router.post('/unmark', unmarkAttendance);
router.get('/report', getAttendanceReport);
router.get('/today', getTodaysAttendance);

export default router;