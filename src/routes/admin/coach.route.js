import express from 'express';
import {
  createCoach,
  getCoachesOfAdmin,
  getAvailableBatches,
  getCoachById,
  updateCoachStatus,
  assignBatchesToCoach,
  deleteCoach,
  unassignBatchFromCoach,
  getCoachBatches
} from '../../controllers/admin/coach.controller.js';
import { authenticateAdmin } from '../../middleware/auth.admin.js';

const CoachRouter = express.Router();

// Coach management routes
CoachRouter.post('/register/coach', authenticateAdmin, createCoach);
CoachRouter.get('/fetch/coaches', authenticateAdmin, getCoachesOfAdmin);
CoachRouter.get('/available-batches', authenticateAdmin, getAvailableBatches);
CoachRouter.get('/fetch/coachById/:id', authenticateAdmin, getCoachById);
CoachRouter.put('/update/coach/:id/status', authenticateAdmin, updateCoachStatus);
CoachRouter.put('/assign/batch/:id/assign-batches', authenticateAdmin, assignBatchesToCoach);
CoachRouter.delete('/delete/coach/:id', authenticateAdmin, deleteCoach);

// New routes for batch assignment management
CoachRouter.delete('/unassign/batch/:coachId/:batchId', authenticateAdmin, unassignBatchFromCoach);
CoachRouter.get('/fetch/coach-batches/:id', authenticateAdmin, getCoachBatches);

export default CoachRouter;