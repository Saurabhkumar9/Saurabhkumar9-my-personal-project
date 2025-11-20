// routes/coach.js
import express from "express";
import {
  sendOtp,
  login,
  getProfile,
  updateProfile,
  logout,
  logoutAll,
  getBatches
} from "../controllers/coachController.js";
import { coachAuth } from "../middlewares/coachAuth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public routes
router.post("/send-otp", sendOtp);
router.post("/login", login);

// Protected routes
router.use(coachAuth);
router.get("/profile", getProfile);
router.put("/profile", upload.single("profile"), updateProfile);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.get("/batches", getBatches);

export default router;