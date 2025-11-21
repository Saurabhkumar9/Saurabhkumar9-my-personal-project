import Batch from "../../models/batches.model.js";
import Student from "../../models/student.model.js";
import Coach from "../../models/coach.model.js";

const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;
// console.log(batchId)
   
    const students = await Student.find({ batchId: batchId });
    // console.log(students)

    // 3️ response always safe (even if no students)
    return res.status(200).json({
      success: true,
      totalStudents: students.length,
      students: students || [],
    });

  } catch (error) {
    console.error("Error fetching batch details:", error);

    res.status(500).json({
      success: false,
      message: "Server error, cannot fetch batch details",
    });
  }
};




const studentDetailsById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // const student = await Student.findOne({_id:studentId});
    const student = await Student.findOne({ _id: studentId });

    const batchFee=await Batch.findById(student.batchId)


    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
      batchfee:batchFee.fee
    });

  } catch (error) {
    console.error("Error fetching student details:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching student details",
    });
  }
};


// Update Student by ID
const studentEditById = async (req, res) => {
  try {
    const { studentId } = req.params; // student id
    const { name, fatherName, motherName, phone, aadharNumber, schoolName, address, batchName } = req.body;

  
    const updateData = {};

   
    if (name !== undefined) updateData.name = name;
    if (fatherName !== undefined) updateData.fatherName = fatherName;
    if (motherName !== undefined) updateData.motherName = motherName;
    if (phone !== undefined) updateData.phone = phone;
    if (aadharNumber !== undefined) updateData.aadharNumber = aadharNumber;
    if (schoolName !== undefined) updateData.schoolName = schoolName;
    if (address !== undefined) updateData.address = address;
    

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true }
    );

    
    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};



const deleteStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(studentId);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: deletedStudent,
    });

  } catch (error) {
    console.error("Delete Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting student",
    });
  }
};

 const createStudentByCoach = async (req, res) => {
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

  

    const { batchId } = req.params;
    const coachId = req.coach?.id; 

    // 👉 CONDITION 5: Admin must be authenticated
    if (!coachId) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required"
      });
    }
    
   
    const existCoach=await Coach.findOne({_id:coachId})

    

   

    

    // 👉 CONDITION 7: Batch must exist
    const existingBatch = await Batch.findById(batchId).select("batchName");

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

   
    const studentWithAadhar = await Student.findOne({
      aadharNumber: trimmedAadhar,
      adminId: existCoach.adminId, 
    });

    if (studentWithAadhar) {
      
      if (studentWithAadhar.batchName === existingBatch.batchName) {
        return res.status(409).json({
          success: false,
          message: `Student with Aadhar ${trimmedAadhar} already exists in batch: ${existingBatch.batchName} under your account.`,
        });
      }

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
      adminId: existCoach.adminId,
      batchId:batchId,
      coachId:coachId,
      createdBy:existCoach.name

    });

    const savedStudent = await student.save();

  

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: savedStudent
    });

  } catch (error) {
  

    console.error("Create student error:", error);

    // ... (Conditions 11, 12, 13: Error handling - kept as is)
   

  

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating student",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
};




export { getBatchDetails,studentDetailsById,studentEditById ,deleteStudentById,createStudentByCoach};
