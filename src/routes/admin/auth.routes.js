// routes/admin.js
import express from "express";
import {
  register,
  verifyEmail,
  login,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  sendOtp,
  resetPassword
} from "../controllers/adminController.js";
import { authenticate } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/reset-password", resetPassword);

// Protected routes
router.use(authenticate);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.get("/profile", getProfile);
router.put("/profile", upload.single("profile"), updateProfile);

export default router;