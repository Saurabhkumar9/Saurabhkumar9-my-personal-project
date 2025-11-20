// controllers/coachController.js
import Coach from "../models/Coach.js";
import Batch from "../models/Batch.js";
import crypto from "crypto";
import transporter from "../services/transporter.js";
import { generateToken, generateDeviceId } from "../utils/jwt.js";
import { getDeviceInfo } from "../utils/deviceFingerprint.js";

/**
 * Send OTP for Coach Login
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const coach = await Coach.findOne({ email: email.toLowerCase() });
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    if (coach.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Your account is not active"
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    coach.otp = otp;
    await coach.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP for Coach Login",
      html: `<p>Your OTP: <b>${otp}</b></p><p>Valid for 10 minutes</p>`
    });

    res.json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
};

/**
 * Verify OTP and Login Coach
 */
export const login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const coach = await Coach.findOne({ email: email.toLowerCase() });
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    if (coach.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Your account is not active"
      });
    }

    // Verify OTP
    if (coach.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const deviceInfo = getDeviceInfo(req);
    const deviceId = generateDeviceId(req);

    // Check device limit
    if (!coach.canAddDevice(deviceId)) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2 devices allowed. Please logout from other device."
      });
    }

    // Add session and update coach
    coach.addSession(deviceInfo, deviceId);
    coach.isVerify = true;
    coach.otp = null;
    coach.lastLogin = new Date();
    await coach.save();

    const token = generateToken(coach._id, deviceId, coach.tokenVersion);

    res.json({
      success: true,
      message: "Login successful",
      token,
      coach: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        profile: coach.profile,
        role: coach.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

/**
 * Get Coach Profile
 */
export const getProfile = async (req, res) => {
  try {
    const coach = await Coach.findById(req.coach._id)
      .select("-otp -tokenVersion")
      .populate("assignedBatches", "batchName timing status");

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    res.json({
      success: true,
      coach
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile"
    });
  }
};

/**
 * Update Coach Profile (Name & Image)
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const coach = req.coach;

    if (name) coach.name = name.trim();
    if (phone) coach.phone = phone;

    // Handle profile image upload
    if (req.file) {
      coach.profile = req.file.path;
      coach.profile_id = req.file.filename;
    }

    await coach.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      coach: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        profile: coach.profile
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed"
    });
  }
};

/**
 * Logout Coach
 */
export const logout = async (req, res) => {
  try {
    const coach = req.coach;
    const deviceId = req.deviceId;

    coach.logoutDevice(deviceId);
    await coach.save();

    res.json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};

/**
 * Logout from All Devices
 */
export const logoutAll = async (req, res) => {
  try {
    const coach = req.coach;
    
    coach.logoutAllDevices();
    await coach.save();

    res.json({
      success: true,
      message: "Logged out from all devices"
    });

  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};

/**
 * Get Assigned Batches
 */
export const getBatches = async (req, res) => {
  try {
    const coach = await Coach.findById(req.coach._id).populate({
      path: "assignedBatches",
      select: "batchName timing fee capacity currentStrength status",
      populate: {
        path: "students",
        select: "name email phone"
      }
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    res.json({
      success: true,
      batches: coach.assignedBatches
    });

  } catch (error) {
    console.error("Get batches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get batches"
    });
  }
};