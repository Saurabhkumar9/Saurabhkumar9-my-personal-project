// middlewares/auth.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const deviceId = generateDeviceId(req);

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isVerify) {
      return res.status(401).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Check token version
    if (decoded.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired"
      });
    }

    // Check device session
    const session = admin.deviceSessions.find(s => s.deviceId === deviceId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid device session"
      });
    }

    // Update activity
    admin.updateSessionActivity(deviceId);
    await admin.save();

    req.admin = admin;
    req.deviceId = deviceId;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

// Helper function
const generateDeviceId = (req) => {
  const crypto = require("crypto");
  const ip = req.ip || "0.0.0.0";
  const userAgent = req.headers["user-agent"] || "unknown";
  return crypto.createHash("md5").update(ip + userAgent).digest("hex");
};