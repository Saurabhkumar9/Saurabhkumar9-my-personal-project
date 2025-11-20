// routes/admin/batch.js
import express from "express";
import {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  assignCoach,
  updateStatus,
  getBatchesByDay,
  getBatchStats
} from "../../controllers/batchController.js";
import { authenticate } from "../../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Batch CRUD routes
router.post("/", createBatch);
router.get("/", getBatches);
router.get("/stats", getBatchStats);
router.get("/day/:day", getBatchesByDay);
router.get("/:id", getBatch);
router.put("/:id", updateBatch);
router.delete("/:id", deleteBatch);

// Batch operations
router.patch("/:id/assign-coach", assignCoach);
router.patch("/:id/status", updateStatus);

export default router;