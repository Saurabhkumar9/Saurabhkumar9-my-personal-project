// middlewares/coachAuth.js
import jwt from "jsonwebtoken";
import Coach from "../models/coach.model.js";

export const authenticateCoach = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        handleErrors(401, "Unauthorized: No token provided. Please login.")
      );
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      return next(handleErrors(500, "Internal server error: Secret key missing."));
    }

    const decoded = jwt.verify(token, secretKey);

    const coach = await Coach.findById(decoded.id).select("-password"); 
    if (!coach) {
      return next(handleErrors(404, "Admin not found. Please register."));
    }

    req.coach = coach;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return next(handleErrors(401, "Invalid or Expired Token. Please login again."));
  }
};