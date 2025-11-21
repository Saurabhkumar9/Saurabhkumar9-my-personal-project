import mongoose from "mongoose";
import Batch from "../../models/batches.model.js";
import Student from "../../models/student.model.js"; // Fixed typo in import path


export const createStudent = async (req, res) => {
  try {
    const {
      name,
      fatherName,
      motherName,
      phone,
      aadharNumber,
      schoolName,
      address,
    } = req.body;

    // ======================================================
    // ===============       VALIDATION PHASE       =================
    // ======================================================

    // ... (Conditions 1, 2, 3: name, fatherName, phone checks - kept as is)
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Student name is required" });
    }
    if (!fatherName?.trim()) {
      return res.status(400).json({ success: false, message: "Father's name is required" });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    
    // 👉 CONDITION 4: Aadhar must be 12 digit numeric
    const trimmedAadhar = aadharNumber?.trim();
    if (
      !trimmedAadhar ||
      trimmedAadhar.length !== 12 ||
      !/^\d+$/.test(trimmedAadhar)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid Aadhar number (12 digits numeric) is required"
      });
    }

    // ======================================================
    // ===============    PARAMS + AUTH CHECK    =================
    // ======================================================

    const { batchId } = req.params;
    const adminId = req.admin?.id; // Assuming adminId is a string or ObjectId

    // 👉 CONDITION 5: Admin must be authenticated
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }
    
    // Ensure adminId is treated as a string for comparison if coming from req.admin
    const adminIdString = adminId.toString();

    // 👉 CONDITION 6: batchId must be a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID format"
      });
    }

    // ======================================================
    // ===============      BATCH VALIDATION      =================
    // ======================================================

    // 👉 CONDITION 7: Batch must exist
    const existingBatch = await Batch.findById(batchId).select("batchName");

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // ======================================================
    // ============   BUSINESS LOGIC CHECKS (FIXED)  =================
    // ======================================================

    // 🎯 IMPORTANT: Multi-tenant check. Find a student with the 
    // SAME AADHAR AND SAME ADMIN.
    const studentWithAadhar = await Student.findOne({
      aadharNumber: trimmedAadhar,
      adminId: adminId, 
    });

    if (studentWithAadhar) {
      // Logic Check: Same Aadhar + Same Admin
      
      // Rule 1: Same Aadhar + Same Admin + Same Batch → NOT CREATE (Conflict)
      if (studentWithAadhar.batchName === existingBatch.batchName) {
        return res.status(409).json({
          success: false,
          message: `Student with Aadhar ${trimmedAadhar} already exists in batch: ${existingBatch.batchName} under your account.`,
        });
      }

      // Rule 2: Same Aadhar + Same Admin + Different Batch → CREATE (Allowed)
      // If we reach here, we continue to student creation.
    }

    
    const student = new Student({
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName?.trim() || "",
      phone: phone.trim(),
      aadharNumber: trimmedAadhar,
      schoolName: schoolName?.trim() || "",
      address: address?.trim() || "",
      batchName: existingBatch.batchName, // store batch name
      adminId: adminId,
      batchId:batchId
    });

    const savedStudent = await student.save();

    // ======================================================
    // ===============     SUCCESS RESPONSE     =================
    // ======================================================

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: savedStudent
    });

  } catch (error) {
    // ======================================================
    // ===============     ERROR HANDLING     ===================
    // ======================================================

    console.error("Create student error:", error);

    // ... (Conditions 11, 12, 13: Error handling - kept as is)
   

  

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating student",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};


// Get all students with filtering and pagination
export const getAllStudents = async (req, res) => {
  try {
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }

    const students = await Student.find({ adminId: adminId })
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key

    // console.log(`Found ${students.length} students for admin: ${adminId}`);

    res.status(200).json({
      success: true,
      message: students.length > 0 ? "Students retrieved successfully" : "No students found",
      data: { 
        students,
        count: students.length
      }
    });
  } catch (error) {
    console.error("Error retrieving students:", error);
    
    res.status(500).json({
      success: false,
      message: "Error retrieving students",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};


export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?.id; 

   

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }
    
    
    const deletedStudent = await Student.findOneAndDelete({ 
      _id: id, 
      adminId: adminId
    });

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found or you don't have permission to delete this student"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: {
        id: deletedStudent._id,
        name: deletedStudent.name
      }
    });
  } catch (error) {
    console.error("Delete student error:", error);
    
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};