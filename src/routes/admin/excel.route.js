import express from 'express';
import {
  excelUploadStudentsByAdmin,
  excelUploadStudentsByCoach,
  getUploadTemplate
} from '../controllers/studentExcel.controller.js';
import { authenticate as adminAuth, updateActivity } from '../middleware/auth.js';
import { authenticate as coachAuth } from '../middleware/coachAuth.js';

const router = express.Router();

// Admin routes
router.post('/admin/batch/:batchId', adminAuth, updateActivity, excelUploadStudentsByAdmin);
router.get('/template', adminAuth, updateActivity, getUploadTemplate);

// Coach routes  
router.post('/coach/batch/:batchId', coachAuth, excelUploadStudentsByCoach);

export default router;