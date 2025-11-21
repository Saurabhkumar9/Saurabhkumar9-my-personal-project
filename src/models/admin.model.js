// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      unique: true, 
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
    role: { 
      type: String, 
      default: "admin" 
    },

    // Verification
    isVerify: { type: Boolean, default: false },
    otp: String,

    // Profile
    profile: String,
    profile_id: String,

    // Device Management (Max 2 devices)
    deviceSessions: [
      {
        deviceId: String,
        userAgent: String,
        ipAddress: String,
        loginAt: Date,
        lastActivity: Date,
      }
    ],

    // Security
    tokenVersion: { type: Number, default: 0 },
    lastLogin: Date,
  },
  { timestamps: true } 
);

// Hash password
adminSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
adminSchema.methods.comparePassword = async function(enteredPassword){
  return bcrypt.compare(enteredPassword, this.password);
};

// Check device limit
adminSchema.methods.canAddDevice = function(deviceId){
  if(this.deviceSessions.length < 2) return true;
  return this.deviceSessions.some(session => session.deviceId === deviceId);
};

// Add/Update session
adminSchema.methods.addSession = function(deviceInfo, deviceId){
  // Remove oldest if limit reached and new device
  if(this.deviceSessions.length >= 2 && !this.deviceSessions.some(s => s.deviceId === deviceId)){
    this.deviceSessions.shift();
  }

  const sessionData = {
    deviceId,
    userAgent: deviceInfo.userAgent,
    ipAddress: deviceInfo.ip,
    loginAt: new Date(),
    lastActivity: new Date()
  };

  const existingIndex = this.deviceSessions.findIndex(s => s.deviceId === deviceId);
  if(existingIndex !== -1) {
    this.deviceSessions[existingIndex] = sessionData;
  } else {
    this.deviceSessions.push(sessionData);
  }
};



// Logout from all devices
adminSchema.methods.logoutAllDevices = function(){
  this.deviceSessions = [];
  this.tokenVersion += 1;
};

const Admin= mongoose.model("Admin", adminSchema);

export default Admin





