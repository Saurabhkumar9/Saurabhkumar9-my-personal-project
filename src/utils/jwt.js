import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Generate JWT token
 * @param {String} userId - MongoDB user/admin ID
 * @param {String} name - User/Admin name
 * @param {String} role - Role (admin/user)
 * @param {String} deviceId - Device identifier
 * @param {Number} tokenVersion - To invalidate old tokens
 * @returns {String} JWT token
 */
export const generateToken = (userId, name, role, deviceId, tokenVersion) => {
  const payload = {
    id: userId,
    name,
    role,
    deviceId,
    tokenVersion
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

/**
 * Generate unique device ID
 * Can be used to identify the user's device/browser
 */
export const generateDeviceId = (req) => {
  // Use IP + User-Agent + random string
  const ip = req.ip || req.headers["x-forwarded-for"] || "0.0.0.0";
  const userAgent = req.headers["user-agent"] || "unknown";
  const random = crypto.randomBytes(6).toString("hex");

  return crypto.createHash("sha256").update(ip + userAgent + random).digest("hex");
};
