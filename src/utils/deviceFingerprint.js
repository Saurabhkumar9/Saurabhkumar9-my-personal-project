// utils/deviceFingerprint.js
/**
 * Get device information
 */
export const getDeviceInfo = (req) => {
  return {
    userAgent: req.headers["user-agent"] || "unknown",
    ip: req.ip || req.headers["x-forwarded-for"] || "0.0.0.0"
  };
};