import Coach from "../../models/coach.model.js";
import Batch from "../../models/batches.model.js";
import handleErrors from "../../middleware/handleErrors.js";
import crypto from "crypto";
import transporter from "../../services/transporter.js";
import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 */
const generateToken = (coachId, coachName, role, expiresIn = "1y") => { 
  return jwt.sign(
    { 
      id: coachId, 
      name: coachName, 
      role: role,
      type: 'coach' 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn }
  );
};

/**
 * Send OTP for Coach Verification
 */
const sendOtpForVerifyCoach = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return next(handleErrors(400, "Please provide an email."));

    const coach = await Coach.findOne({ email: email.toLowerCase().trim() });
    if (!coach) return next(handleErrors(404, "Coach details not found."));

    if (coach.status !== "active") return next(handleErrors(403, "Only active coaches can login."));

    const otp = crypto.randomInt(100000, 999999).toString();
    coach.otp = otp;
    await coach.save({ validateBeforeSave: false });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "OTP for Login",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Login Request</h2>
            <p>Your OTP for login is:</p>
            <h1 style="color: #dc2626; font-size: 32px; text-align: center; letter-spacing: 5px;">
              ${otp}
            </h1>
            <p>This OTP will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 12px;">
              If you didn't request this, please secure your account immediately.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return next(handleErrors(500, "Failed to send OTP email. Please try again."));
    }

    res.status(200).json({ 
      success: true, 
      message: "If the email exists, an OTP has been sent." 
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    next(handleErrors(500, "Failed to process request. Please try again."));
  }
};

/**
 * Verify OTP and Login Coach
 */
const verifyCoachAndLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email?.trim() || !otp) return next(handleErrors(400, "Please provide email and OTP."));

    const coach = await Coach.findOne({ email: email.toLowerCase().trim() });
    if (!coach) return next(handleErrors(404, "Coach not found."));

    if (coach.otp !== otp) return next(handleErrors(400, "Invalid OTP."));

    // const otpAge = (new Date() - new Date(coach.createdAt)) / (1000 * 60); // minutes
    // if (otpAge > 10) {
    //   coach.otp = null;
    //   await coach.save({ validateBeforeSave: false });
    //   return next(handleErrors(400, "OTP has expired. Please request a new one."));
    // }

    coach.isVerify = true;
    coach.otp = null;
    await coach.save({ validateBeforeSave: false });
    console.log(coach.role)

    const token = generateToken(coach._id, coach.name, coach.role);

    res.status(200).json({ 
      success: true,
      message: "Login successful.",
      token,
      role: coach.role,
      coach: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        role:coach.role
      }
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    next(handleErrors(500, "Verification failed. Please try again."));
  }
};





const getCoachById = async (req, res) => {
  try {
    const coachId = req.coach.id;

    console.log(coachId)
    // 1️ Coach details fetch (without password, otp)
    const coach = await Coach.findById({_id:coachId})
      .select("-password -otp");

      
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    // 2️ If no assigned batches → return only coach details
    if (!coach.assignedBatches || coach.assignedBatches.length === 0) {
      return res.status(200).json({
        success: true,
        coach,
        batches: [],
      });
    }

    // 3️Fetch all batch details using assignedBatches[]
    const batches = await Batch.find({
      _id: { $in: coach.assignedBatches }
    });

    
    // 4️ Add students inside each batch
    // for (let b of batches) {
    //   const students = await Student.find({ batchId: b._id });
    //   b._doc.students = students;
    // }

    // 5️ Final response
    return res.status(200).json({
      success: true,
      coach,
      totalAssigned: coach.assignedBatches.length,
      batches,
    });

  } catch (error) {
    console.error("Error while fetching coach:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export { sendOtpForVerifyCoach, verifyCoachAndLogin,getCoachById };
