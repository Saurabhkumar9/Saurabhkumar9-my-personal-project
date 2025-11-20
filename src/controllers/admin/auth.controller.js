// controllers/adminController.js
import Admin from "../models/Admin.js";
import { generateToken, generateDeviceId } from "../utils/jwt.js";
import { getDeviceInfo } from "../utils/deviceFingerprint.js";
import crypto from "crypto";
import transporter from "../services/transporter.js";

/**
 * Register Admin
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // Check if admin exists
    let admin = await Admin.findOne({ email: email.toLowerCase() });
    const otp = crypto.randomInt(100000, 999999).toString();

    if (admin) {
      if (admin.isVerify) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }
      // Update existing unverified admin
      admin.name = name.trim();
      admin.password = password;
      admin.otp = otp;
    } else {
      // Create new admin
      admin = new Admin({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        otp
      });
    }

    await admin.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Your OTP: <b>${otp}</b></p><p>Valid for 10 minutes</p>`
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

/**
 * Verify Email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Check OTP
    if (admin.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Verify admin
    admin.isVerify = true;
    admin.otp = null;
    await admin.save();

    // Generate token
    const deviceId = generateDeviceId(req);
    const token = generateToken(admin._id, deviceId, admin.tokenVersion);

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
};

/**
 * Login Admin
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!admin.isVerify) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first"
      });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const deviceInfo = getDeviceInfo(req);
    const deviceId = generateDeviceId(req);

    // Check device limit
    if (!admin.canAddDevice(deviceId)) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2 devices allowed. Please logout from other device."
      });
    }

    // Add session
    admin.addSession(deviceInfo, deviceId);
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id, deviceId, admin.tokenVersion);

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
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
 * Logout
 */
export const logout = async (req, res) => {
  try {
    const admin = req.admin;
    const deviceId = req.deviceId;

    admin.logoutDevice(deviceId);
    await admin.save();

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
 * Logout All Devices
 */
export const logoutAll = async (req, res) => {
  try {
    const admin = req.admin;
    
    admin.logoutAllDevices();
    await admin.save();

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
 * Get Profile
 */
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    
    res.json({
      success: true,
      admin
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
 * Update Profile (Name & Image)
 */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const admin = req.admin;

    if (name) admin.name = name.trim();
    if (req.file) {
      admin.profile = req.file.path;
      admin.profile_id = req.file.filename;
    }

    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        profile: admin.profile
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
 * Send OTP for Password Reset
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

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (admin) {
      const otp = crypto.randomInt(100000, 999999).toString();
      admin.otp = otp;
      await admin.save();

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP: <b>${otp}</b></p><p>Valid for 10 minutes</p>`
      });
    }

    res.json({
      success: true,
      message: "If email exists, OTP has been sent"
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
 * Reset Password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, password and OTP are required"
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || admin.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    admin.password = password;
    admin.otp = null;
    admin.logoutAllDevices();
    await admin.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed"
    });
  }
};