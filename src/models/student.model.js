// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    aadharNumber: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    batchName: {
      type: String,
      required: true,
    },
    
    // New Image Fields
    profile: String,
    profile_id: String,
    aadharCardImage: String,
    aadharCardImage_id: String,
    
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
    },

    // Fee Details
    fee: [
      {
        month: String,
        status: String,
        date: Date,
        amount: Number
      },
    ],
    
    createdBy: String,

    // Attendance
    attendance: [
      {
        date: Date,
        status: {
          type: String,
          enum: ["present", "absent", "leave"],
        },
        remark: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);