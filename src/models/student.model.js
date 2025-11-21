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
    profile: {
      type:String,
      default:''
    },
    profile_id:  {
      type:String,
      default:''
    },
    aadharCardImage: {
      type:String,
      default:''
    },
    aadharCardImage_id:  {
      type:String,
      default:''
    },
    
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
        month: {
          type: String,
          required: [true, "Month name is required"],
          trim: true,
        },
        status: {
          type: String,
          
        },
        Date:{
          type:Date
        },
        amount:{
          type:Number
        }

      },
    ],
    
    createdBy: String,

    // Attendance
     attendance: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["present", "absent", "leave"],
        },
        remark: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);