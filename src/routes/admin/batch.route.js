// routes/batchRoutes.js
import express from 'express';
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignCoach
} from '../../controllers/admin/batches.controller.js';
import { authenticateAdmin } from '../../middleware/auth.admin.js';

const BatchRouter = express.Router();

BatchRouter.post('/register/batch', authenticateAdmin, createBatch);
BatchRouter.get('/fetch/batch', authenticateAdmin, getBatches);
BatchRouter.get('/batch-fetch/:id', authenticateAdmin, getBatchById);
BatchRouter.put('/update/batch/:id', authenticateAdmin, updateBatch);
BatchRouter.delete('/delete/batch/:id', authenticateAdmin, deleteBatch);
BatchRouter.patch('/batch/assign/:id/assign-coach', authenticateAdmin, assignCoach);

export default BatchRouter;