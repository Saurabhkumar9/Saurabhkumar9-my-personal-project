// models/Batch.js
import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true,
    },
    timing: {
      type: String,
      trim: true,
      default: "Not Assigned",
    },
    fee: {
      type: Number,
      min: 0,
      default: 0,
    },
    
    // New: Week Days Array
    weekDays: [{
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    }],
    
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach", 
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    createdBy: {
      type: String,
      trim: true,
    },
    
    coachName: {
      type: String,
      trim:true
    }
  },
  {
    timestamps: true,
  }
);



const Batch = mongoose.model("Batch", batchSchema);
export default Batch;