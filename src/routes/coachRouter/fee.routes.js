import express from 'express';
import {
  payFee,
  payFeeCurrentMonth,
  unpayFee,
  getFeeReport,
  getPendingFees
} from '../controllers/fee.controller.js';
import { authenticate, updateActivity } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate, updateActivity);

// Fee operations
router.post('/pay', payFee);
router.post('/bulk-pay', payFeeCurrentMonth);
router.post('/unpay', unpayFee);
router.get('/report', getFeeReport);
router.get('/pending', getPendingFees);

export default router;