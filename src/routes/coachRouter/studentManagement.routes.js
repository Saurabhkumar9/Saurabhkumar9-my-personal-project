import express from 'express';
import {
  getBatchDetails,
  studentDetailsById,
  studentEditById,
  deleteStudentById,
  createStudentByCoach
} from '../controllers/studentManagement.controller.js';
import { authenticate as adminAuth, updateActivity } from '../middleware/auth.js';
import { authenticate as coachAuth } from '../middleware/coachAuth.js';

const router = express.Router();

// Admin routes
router.get('/batch/:batchId', adminAuth, updateActivity, getBatchDetails);
router.get('/:studentId', adminAuth, updateActivity, studentDetailsById);
router.put('/:studentId', adminAuth, updateActivity, studentEditById);
router.delete('/:studentId', adminAuth, updateActivity, deleteStudentById);

// Coach routes
router.post('/coach/batch/:batchId', coachAuth, createStudentByCoach);
router.get('/coach/batch/:batchId', coachAuth, getBatchDetails);
router.get('/coach/:studentId', coachAuth, studentDetailsById);
router.put('/coach/:studentId', coachAuth, studentEditById);

export default router;