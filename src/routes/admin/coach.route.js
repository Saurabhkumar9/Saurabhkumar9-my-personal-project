// routes/admin/coach.js
import express from "express";
import {
  createCoach,
  getCoaches,
  getCoach,
  updateCoach,
  deleteCoach,
  assignBatches,
  updateStatus
} from "../../controllers/coachController.js";
import { authenticate } from "../../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Coach CRUD routes
router.post("/", createCoach);
router.get("/", getCoaches);
router.get("/:id", getCoach);
router.put("/:id", updateCoach);
router.delete("/:id", deleteCoach);

// Additional coach operations
router.post("/:id/assign-batches", assignBatches);
router.patch("/:id/status", updateStatus);

export default router;