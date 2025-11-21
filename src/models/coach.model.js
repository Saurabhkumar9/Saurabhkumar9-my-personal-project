// models/Coach.js
import mongoose from "mongoose";

const coachSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    
   profile: {
      type: String,
      default: null
    },
    profile_id: {
      type: String,
      default: null
    },

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

    assignedBatches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    }],
    
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    // Verification
    otp: {
      type: String,
      default: null
    },
    otpCreatedAt: {
      type: Date,
      default: null
    },
    isVerify: {
      type: Boolean,
      default: false
    },
    
    role: {
      type: String,
      default: "coach",
    },

   status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },


    // Security
    tokenVersion: {
      type: Number,
      default: 0
    },
    
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Check device limit
coachSchema.methods.canAddDevice = function(deviceId) {
  if (this.deviceSessions.length < 2) return true;
  return this.deviceSessions.some(session => session.deviceId === deviceId);
};

// Add/Update session
coachSchema.methods.addSession = function(deviceInfo, deviceId) {
  // Remove oldest if limit reached and new device
  if (this.deviceSessions.length >= 2 && !this.deviceSessions.some(s => s.deviceId === deviceId)) {
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
  if (existingIndex !== -1) {
    this.deviceSessions[existingIndex] = sessionData;
  } else {
    this.deviceSessions.push(sessionData);
  }
};


// Logout from specific device
coachSchema.methods.logoutDevice = function(deviceId) {
  this.deviceSessions = this.deviceSessions.filter(session => session.deviceId !== deviceId);
};

// Logout from all devices
coachSchema.methods.logoutAllDevices = function() {
  this.deviceSessions = [];
  this.tokenVersion += 1;
};

const Coach = mongoose.model("Coach", coachSchema);
export default Coach;