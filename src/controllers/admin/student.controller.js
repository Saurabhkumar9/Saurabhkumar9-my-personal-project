// controllers/studentController.js
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";

/**
 * Create Student
 */
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
      batchName
    } = req.body;

    const adminId = req.admin.id;
    const createdBy = req.admin.name;

    // Basic validation
    if (!name || !fatherName || !phone || !aadharNumber || !batchName) {
      return res.status(400).json({
        success: false,
        message: "Name, father name, phone, aadhar number and batch name are required"
      });
    }

    // Check if student with phone already exists
    const existingStudent = await Student.findOne({ 
      phone: phone.trim(), 
      adminId 
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this phone number already exists"
      });
    }

    // Find batch
    const batch = await Batch.findOne({ 
      batchName: batchName.trim(), 
      adminId 
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // Create student
    const student = new Student({
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName?.trim() || "",
      phone: phone.trim(),
      aadharNumber: aadharNumber.trim(),
      schoolName: schoolName?.trim() || "",
      address: address?.trim() || "",
      batchName: batchName.trim(),
      batchId: batch._id,
      coachId: batch.coachId,
      adminId,
      createdBy,
      
      // Handle uploaded images
      profile: req.files?.profile?.[0]?.path || "",
      profile_id: req.files?.profile?.[0]?.filename || "",
      aadharCardImage: req.files?.aadharCardImage?.[0]?.path || "",
      aadharCardImage_id: req.files?.aadharCardImage?.[0]?.filename || "",
    });

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("batchId", "batchName timing")
      .populate("coachId", "name");

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: populatedStudent
    });

  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create student"
    });
  }
};

/**
 * Get All Students
 */
export const getStudents = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { page = 1, limit = 10, batchId, search } = req.query;

    // Build query
    const query = { adminId };
    if (batchId) query.batchId = batchId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const students = await Student.find(query)
      .populate("batchId", "batchName timing")
      .populate("coachId", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

/**
 * Get Single Student
 */
export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const student = await Student.findOne({ _id: id, adminId })
      .populate("batchId", "batchName timing fee")
      .populate("coachId", "name email phone");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student
    });

  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student"
    });
  }
};

/**
 * Update Student
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, motherName, phone, schoolName, address } = req.body;
    const adminId = req.admin.id;

    const student = await Student.findOne({ _id: id, adminId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Update fields
    if (name) student.name = name.trim();
    if (fatherName) student.fatherName = fatherName.trim();
    if (motherName) student.motherName = motherName.trim();
    if (phone) student.phone = phone.trim();
    if (schoolName) student.schoolName = schoolName.trim();
    if (address) student.address = address.trim();

    // Update images if provided
    if (req.files?.profile?.[0]) {
      student.profile = req.files.profile[0].path;
      student.profile_id = req.files.profile[0].filename;
    }

    if (req.files?.aadharCardImage?.[0]) {
      student.aadharCardImage = req.files.aadharCardImage[0].path;
      student.aadharCardImage_id = req.files.aadharCardImage[0].filename;
    }

    await student.save();

    const updatedStudent = await Student.findById(id)
      .populate("batchId", "batchName timing")
      .populate("coachId", "name");

    res.json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  }
};

/**
 * Delete Student
 */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const student = await Student.findOne({ _id: id, adminId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    await Student.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Student deleted successfully"
    });

  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student"
    });
  }
};

/**
 * Get Students by Batch
 */
export const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const adminId = req.admin.id;

    const students = await Student.find({ batchId, adminId })
      .populate("batchId", "batchName timing")
      .populate("coachId", "name")
      .sort({ name: 1 });

    res.json({
      success: true,
      students,
      count: students.length
    });

  } catch (error) {
    console.error("Get students by batch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

/**
 * Add Fee Payment
 */
export const addFeePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, amount, date } = req.body;
    const adminId = req.admin.id;

    const student = await Student.findOne({ _id: id, adminId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Add fee payment
    student.fee.push({
      month,
      amount,
      date: date || new Date(),
      status: "paid"
    });

    await student.save();

    res.json({
      success: true,
      message: "Fee payment added successfully",
      student: {
        id: student._id,
        name: student.name,
        fee: student.fee
      }
    });

  } catch (error) {
    console.error("Add fee payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add fee payment"
    });
  }
};

/**
 * Mark Attendance
 */
export const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status, remark } = req.body;
    const adminId = req.admin.id;

    const student = await Student.findOne({ _id: id, adminId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Add attendance
    student.attendance.push({
      date: date || new Date(),
      status,
      remark: remark || ""
    });

    await student.save();

    res.json({
      success: true,
      message: "Attendance marked successfully",
      student: {
        id: student._id,
        name: student.name,
        attendance: student.attendance
      }
    });

  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance"
    });
  }
};