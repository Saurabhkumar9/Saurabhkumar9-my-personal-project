// controllers/studentExcelController.js
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import Coach from "../models/Coach.js";

/**
 * Validate Student Data from Excel
 */
const validateStudentData = (student) => {
  const errors = [];
  
  if (!student.name?.trim()) errors.push("Name is required");
  if (!student.fatherName?.trim()) errors.push("Father name is required");
  if (!student.phone?.trim()) errors.push("Phone is required");
  if (!/^[6-9]\d{9}$/.test(student.phone)) errors.push("Invalid phone number");
  if (!student.aadharNumber?.trim()) errors.push("Aadhar number is required");
  if (!/^\d{12}$/.test(student.aadharNumber)) errors.push("Aadhar must be 12 digits");
  
  return errors;
};

/**
 * Process Student Data
 */
const processStudentData = (student) => {
  return {
    name: student.name.toString().trim(),
    fatherName: student.fatherName.toString().trim(),
    motherName: student.motherName?.toString().trim() || "",
    phone: student.phone.toString().trim(),
    aadharNumber: student.aadharNumber.toString().trim(),
    schoolName: student.schoolName?.toString().trim() || "",
    address: student.address?.toString().trim() || "",
  };
};

/**
 * Excel Upload by Admin
 */
export const excelUploadByAdmin = async (req, res) => {
  try {
    const { students } = req.body;
    const { batchId } = req.params;
    const adminId = req.admin.id;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: "Students array is required"
      });
    }

    if (students.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Maximum 100 students allowed per upload"
      });
    }

    // Check batch
    const batch = await Batch.findOne({ _id: batchId, adminId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // Check capacity
    if (batch.currentStrength + students.length > batch.capacity) {
      return res.status(400).json({
        success: false,
        message: `Batch capacity exceeded. Only ${batch.capacity - batch.currentStrength} seats available`
      });
    }

    const insertedStudents = [];
    const skippedStudents = [];

    // Process each student
    for (const [index, studentData] of students.entries()) {
      try {
        // Validate data
        const errors = validateStudentData(studentData);
        if (errors.length > 0) {
          skippedStudents.push({
            row: index + 1,
            name: studentData.name || "Unknown",
            reason: errors.join(", ")
          });
          continue;
        }

        const processedData = processStudentData(studentData);

        // Check duplicates
        const existingStudent = await Student.findOne({
          $or: [
            { phone: processedData.phone, adminId },
            { aadharNumber: processedData.aadharNumber, adminId }
          ]
        });

        if (existingStudent) {
          skippedStudents.push({
            row: index + 1,
            name: processedData.name,
            reason: "Student with same phone or Aadhar already exists"
          });
          continue;
        }

        // Create student
        const student = new Student({
          ...processedData,
          batchName: batch.batchName,
          batchId: batch._id,
          coachId: batch.coachId,
          adminId,
          createdBy: req.admin.name
        });

        await student.save();
        insertedStudents.push({
          name: student.name,
          phone: student.phone
        });

      } catch (error) {
        skippedStudents.push({
          row: index + 1,
          name: studentData.name || "Unknown",
          reason: error.message
        });
      }
    }

    // Update batch strength
    if (insertedStudents.length > 0) {
      await Batch.findByIdAndUpdate(batchId, {
        $inc: { currentStrength: insertedStudents.length }
      });
    }

    res.json({
      success: true,
      message: "Excel upload completed",
      summary: {
        total: students.length,
        inserted: insertedStudents.length,
        skipped: skippedStudents.length
      },
      insertedStudents: insertedStudents.slice(0, 5),
      skippedStudents: skippedStudents.slice(0, 10)
    });

  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload students"
    });
  }
};

/**
 * Excel Upload by Coach
 */
export const excelUploadByCoach = async (req, res) => {
  try {
    const { students } = req.body;
    const { batchId } = req.params;
    const coachId = req.coach.id;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: "Students array is required"
      });
    }

    // Get coach details
    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    // Check batch assignment
    const batch = await Batch.findOne({ 
      _id: batchId, 
      coachId: coachId 
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found or not assigned to you"
      });
    }

    // Check capacity
    if (batch.currentStrength + students.length > batch.capacity) {
      return res.status(400).json({
        success: false,
        message: `Batch capacity exceeded. Only ${batch.capacity - batch.currentStrength} seats available`
      });
    }

    const insertedStudents = [];
    const skippedStudents = [];

    // Process each student
    for (const [index, studentData] of students.entries()) {
      try {
        // Validate data
        const errors = validateStudentData(studentData);
        if (errors.length > 0) {
          skippedStudents.push({
            row: index + 1,
            name: studentData.name || "Unknown",
            reason: errors.join(", ")
          });
          continue;
        }

        const processedData = processStudentData(studentData);

        // Check duplicates
        const existingStudent = await Student.findOne({
          $or: [
            { phone: processedData.phone, adminId: coach.adminId },
            { aadharNumber: processedData.aadharNumber, adminId: coach.adminId }
          ]
        });

        if (existingStudent) {
          skippedStudents.push({
            row: index + 1,
            name: processedData.name,
            reason: "Student with same phone or Aadhar already exists"
          });
          continue;
        }

        // Create student
        const student = new Student({
          ...processedData,
          batchName: batch.batchName,
          batchId: batch._id,
          coachId: coachId,
          adminId: coach.adminId,
          createdBy: coach.name
        });

        await student.save();
        insertedStudents.push({
          name: student.name,
          phone: student.phone
        });

      } catch (error) {
        skippedStudents.push({
          row: index + 1,
          name: studentData.name || "Unknown",
          reason: error.message
        });
      }
    }

    // Update batch strength
    if (insertedStudents.length > 0) {
      await Batch.findByIdAndUpdate(batchId, {
        $inc: { currentStrength: insertedStudents.length }
      });
    }

    res.json({
      success: true,
      message: "Excel upload completed",
      summary: {
        total: students.length,
        inserted: insertedStudents.length,
        skipped: skippedStudents.length
      },
      insertedStudents: insertedStudents.slice(0, 5),
      skippedStudents: skippedStudents.slice(0, 10)
    });

  } catch (error) {
    console.error("Coach excel upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload students"
    });
  }
};

/**
 * Get Upload Template
 */
export const getUploadTemplate = async (req, res) => {
  try {
    const template = {
      requiredFields: ["name", "fatherName", "phone", "aadharNumber"],
      optionalFields: ["motherName", "schoolName", "address"],
      sample: [
        {
          name: "Rahul Sharma",
          fatherName: "Rajesh Sharma", 
          motherName: "Priya Sharma",
          phone: "9876543210",
          aadharNumber: "123456789012",
          schoolName: "Delhi Public School",
          address: "123 Main Street, Delhi"
        }
      ],
      instructions: [
        "Phone must be 10 digits starting with 6-9",
        "Aadhar must be exactly 12 digits",
        "Maximum 100 students per upload"
      ]
    };

    res.json({
      success: true,
      template
    });

  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get template"
    });
  }
};