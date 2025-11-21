// routes/admin.js
import express from "express";
import {
  register,
  verifyEmail,
  login,
 
  logout,
  getProfile,
  updateProfile,
  sendOtp,
  resetPassword
} from "../../controllers/admin/auth.controller.js";
import { authenticateAdmin } from "../../middleware/auth.admin.js";
import upload from "../../middleware/upload.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/login", login);
authRouter.post("/otp-send-password", sendOtp);
authRouter.post("/password-reset", resetPassword);

// Protected routes


authRouter.post("/logout", authenticateAdmin,logout);
authRouter.get("/profile",authenticateAdmin, getProfile);
authRouter.put("/profile",authenticateAdmin, upload.single("profile"), updateProfile);

export default authRouter;