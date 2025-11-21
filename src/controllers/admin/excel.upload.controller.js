import mongoose from "mongoose";
import Batch from "../../models/batches.model.js";
import Student from "../../models/student.model.js";
import Coach from '../../models/coach.model.js'

export const excelUploadStudentsByAdmin = async (req, res) => {
  try {
    const { array: studentsArray } = req.body;
    const { batchId } = req.params;
    const adminId = req.admin?.id;


    if (!adminId) {
      return res.status(401).json({ success: false, message: "Admin authentication required." });
    }

    if (!studentsArray || !Array.isArray(studentsArray) || studentsArray.length === 0) {
      return res.status(400).json({ success: false, message: "No student data provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ success: false, message: "Invalid batch ID" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const requiredFields = ["name", "fatherName", "phone", "aadharNumber"];
    const insertedStudents = [];
    const skippedStudents = [];

    for (const studentData of studentsArray) {
      // Validate required fields
      let isValid = true;
      for (const field of requiredFields) {
        if (!studentData[field]?.toString().trim()) {
          isValid = false;
          break;
        }
      }
      if (!isValid) {
        skippedStudents.push({ ...studentData, reason: "Missing required field" });
        continue;
      }

      // Check if student already exists in the same batch
      const exists = await Student.findOne({
        aadharNumber: studentData.aadharNumber.toString().trim(),
        batchId: batchId,
        adminId: adminId,
      });

      if (exists) {
        skippedStudents.push({ ...studentData, reason: "Duplicate student in batch" });
        continue;
      }

      // Create new student
      const newStudent = new Student({
        name: studentData.name.toString().trim(),
        fatherName: studentData.fatherName.toString().trim(),
        motherName: studentData.motherName?.toString().trim() || "",
        phone: studentData.phone.toString().trim(),
        aadharNumber: studentData.aadharNumber.toString().trim(),
        schoolName: studentData.schoolName?.toString().trim() || "",
        batchName: batch.batchName,
        adminId,
        batchId,
      });

      const saved = await newStudent.save();
      insertedStudents.push(saved);
    }

    return res.status(201).json({
      success: true,
      message: "Bulk upload completed",
      insertedCount: insertedStudents.length,
      skippedCount: skippedStudents.length,
      skippedStudents,
      insertedStudents,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during bulk upload",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};

export const excelUploadStudentsByCoach = async (req, res) => {
  try {
    const { array: studentsArray } = req.body;
    const { batchId } = req.params;
    const coachId = req.coach?.id;

   


    if (!coachId) {
      return res.status(401).json({ success: false, message: "Coach authentication required." });
    }

    if (!studentsArray || !Array.isArray(studentsArray) || studentsArray.length === 0) {
      return res.status(400).json({ success: false, message: "No student data provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ success: false, message: "Invalid batch ID" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const requiredFields = ["name", "fatherName", "phone", "aadharNumber"];
    const insertedStudents = [];
    const skippedStudents = [];


     const currentCoach=await Coach.findOne({_id:coachId})

    

    for (const studentData of studentsArray) {
      // Validate required fields
      let isValid = true;
      for (const field of requiredFields) {
        if (!studentData[field]?.toString().trim()) {
          isValid = false;
          break;
        }
      }
      if (!isValid) {
        skippedStudents.push({ ...studentData, reason: "Missing required field" });
        continue;
      }

     
      // Check if student already exists in the same batch
      const exists = await Student.findOne({
        aadharNumber: studentData.aadharNumber.toString().trim(),
        batchId: batchId,
        adminId: currentCoach.adminId,
      });

      if (exists) {
        skippedStudents.push({ ...studentData, reason: "Duplicate student in batch" });
        continue;
      }


      

      // Create new student
      const newStudent = new Student({
        name: studentData.name.toString().trim(),
        fatherName: studentData.fatherName.toString().trim(),
        motherName: studentData.motherName?.toString().trim() || "",
        phone: studentData.phone.toString().trim(),
        aadharNumber: studentData.aadharNumber.toString().trim(),
        schoolName: studentData.schoolName?.toString().trim() || "",
        batchName: batch.batchName,
        adminId:currentCoach.adminId,
        batchId,
      });

      const saved = await newStudent.save();
      insertedStudents.push(saved);
    }

    return res.status(201).json({
      success: true,
      message: "Bulk upload completed",
      insertedCount: insertedStudents.length,
      skippedCount: skippedStudents.length,
      skippedStudents,
      insertedStudents,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during bulk upload",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    });
  }
};