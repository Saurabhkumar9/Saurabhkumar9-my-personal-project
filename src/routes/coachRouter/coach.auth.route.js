// routes/coach.js
import express from "express";
import {
 verifyCoachAndLogin,sendOtpForVerifyCoach,
 getCoachById
} from "../../controllers/coachController/coach.auth.controller.js";
import { authenticateCoach } from "../../middleware/auth.coach.js";


const CoachAuthRouter = express.Router();

// Public routes
CoachAuthRouter.post('/send-opt', sendOtpForVerifyCoach)
CoachAuthRouter.post('/login-coach', verifyCoachAndLogin)


CoachAuthRouter.get('/fetch-coach-details',authenticateCoach,getCoachById)

export default CoachAuthRouter;