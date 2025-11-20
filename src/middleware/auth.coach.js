// middlewares/coachAuth.js
import jwt from "jsonwebtoken";
import Coach from "../models/Coach.js";

export const coachAuth = async (req, res, next) => {
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

    const coach = await Coach.findById(decoded.id);
    if (!coach || !coach.isVerify || coach.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Coach not found or inactive"
      });
    }

    // Check token version
    if (decoded.tokenVersion !== coach.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired"
      });
    }

    // Check device session
    const session = coach.deviceSessions.find(s => s.deviceId === deviceId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid device session"
      });
    }

    // Update activity
    coach.updateSessionActivity(deviceId);
    await coach.save();

    req.coach = coach;
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