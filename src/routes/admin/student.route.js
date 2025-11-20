import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByBatch,
  getStudentStatistics
} from '../controllers/student.controller.js';
import { authenticate, updateActivity } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate, updateActivity);

// Student CRUD operations
router.post('/batch/:batchId', createStudent);
router.get('/', getAllStudents);
router.get('/statistics', getStudentStatistics);
router.get('/batch/:batchId', getStudentsByBatch);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;