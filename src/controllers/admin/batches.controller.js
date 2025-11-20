// controllers/batchController.js
import Batch from "../models/Batch.js";
import Coach from "../models/Coach.js";
import Student from '../models/Student.js';

/**
 * Create Batch with Week Days
 */
export const createBatch = async (req, res) => {
  try {
    const { batchName, timing, fee, weekDays, coachName } = req.body;
    const adminId = req.admin.id;
    const createdBy = req.admin.name;

    if (!batchName) {
      return res.status(400).json({
        success: false,
        message: "Batch name is required"
      });
    }

    // Validate weekDays if provided
    if (weekDays && Array.isArray(weekDays)) {
      const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const invalidDays = weekDays.filter(day => !validDays.includes(day.toLowerCase()));
      
      if (invalidDays.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid days: ${invalidDays.join(', ')}`
        });
      }
    }

    // Check if batch name already exists
    const existingBatch = await Batch.findOne({ 
      batchName: batchName.trim(), 
      adminId 
    });
    
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch with this name already exists"
      });
    }

    // Create batch
    const batch = new Batch({
      batchName: batchName.trim(),
      timing: timing?.trim() || "Not Assigned",
      fee: fee || 0,
      weekDays: weekDays || [],
      coachName: coachName?.trim() || "",
      adminId,
      createdBy
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch
    });

  } catch (error) {
    console.error("Create batch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create batch"
    });
  }
};

/**
 * Get All Batches
 */
export const getBatches = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { page = 1, limit = 10, status, coachId, day } = req.query;

    // Build query
    const query = { adminId };
    if (status) query.status = status;
    if (coachId) query.coachId = coachId;
    if (day) query.weekDays = day.toLowerCase();

    const skip = (page - 1) * limit;

    const batches = await Batch.find(query)
      .populate("coachId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Batch.countDocuments(query);

    res.json({
      success: true,
      batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get batches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches"
    });
  }
};

/**
 * Get Single Batch
 */
export const getBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId })
      .populate("coachId", "name email phone specialization")
      .populate("adminId", "name email");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // Get student count for this batch
    const studentCount = await Student.countDocuments({ batchId: id });

    res.json({
      success: true,
      batch: {
        ...batch.toObject(),
        studentCount
      }
    });

  } catch (error) {
    console.error("Get batch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batch"
    });
  }
};

/**
 * Update Batch
 */
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { batchName, timing, fee, weekDays, coachName, status } = req.body;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // Validate weekDays if provided
    if (weekDays && Array.isArray(weekDays)) {
      const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const invalidDays = weekDays.filter(day => !validDays.includes(day.toLowerCase()));
      
      if (invalidDays.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid days: ${invalidDays.join(', ')}`
        });
      }
      batch.weekDays = weekDays;
    }

    // Update other fields
    if (batchName) batch.batchName = batchName.trim();
    if (timing) batch.timing = timing.trim();
    if (fee !== undefined) batch.fee = fee;
    if (coachName !== undefined) batch.coachName = coachName.trim();
    if (status) batch.status = status;

    await batch.save();

    const updatedBatch = await Batch.findById(id)
      .populate("coachId", "name email");

    res.json({
      success: true,
      message: "Batch updated successfully",
      batch: updatedBatch
    });

  } catch (error) {
    console.error("Update batch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update batch"
    });
  }
};

/**
 * Assign Coach to Batch
 */
export const assignCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { coachId } = req.body;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // Check if coach exists and belongs to admin
    if (coachId) {
      const coach = await Coach.findOne({ _id: coachId, adminId });
      if (!coach) {
        return res.status(404).json({
          success: false,
          message: "Coach not found"
        });
      }
      batch.coachId = coachId;
      batch.coachName = coach.name;
    } else {
      batch.coachId = null;
      batch.coachName = "";
    }

    await batch.save();

    const updatedBatch = await Batch.findById(id)
      .populate("coachId", "name email");

    res.json({
      success: true,
      message: coachId ? "Coach assigned successfully" : "Coach removed successfully",
      batch: updatedBatch
    });

  } catch (error) {
    console.error("Assign coach error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign coach"
    });
  }
};

/**
 * Delete Batch
 */
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // Check if batch has students
    const studentCount = await Student.countDocuments({ batchId: id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete batch with students"
      });
    }

    await Batch.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Batch deleted successfully"
    });

  } catch (error) {
    console.error("Delete batch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete batch"
    });
  }
};

/**
 * Update Batch Status
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.admin.id;

    if (!['active', 'inactive', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active, inactive or archived"
      });
    }

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    batch.status = status;
    await batch.save();

    res.json({
      success: true,
      message: `Batch status updated to ${status}`,
      batch: {
        id: batch._id,
        batchName: batch.batchName,
        status: batch.status
      }
    });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
};

/**
 * Get Batches by Day
 */
export const getBatchesByDay = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { day } = req.params;

    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid day. Valid days are: ${validDays.join(', ')}`
      });
    }

    const batches = await Batch.find({ 
      adminId, 
      status: 'active',
      weekDays: day.toLowerCase()
    })
    .populate("coachId", "name email")
    .sort({ timing: 1 });

    res.json({
      success: true,
      day: day.toLowerCase(),
      batches,
      count: batches.length
    });

  } catch (error) {
    console.error("Get batches by day error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches"
    });
  }
};

/**
 * Get Batch Statistics
 */
export const getBatchStats = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const totalBatches = await Batch.countDocuments({ adminId });
    const activeBatches = await Batch.countDocuments({ adminId, status: 'active' });
    const batchesWithCoach = await Batch.countDocuments({ adminId, coachId: { $ne: null } });
    
    // Get batches by day
    const dayStats = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    for (let day of days) {
      const count = await Batch.countDocuments({ 
        adminId, 
        status: 'active',
        weekDays: day 
      });
      dayStats[day] = count;
    }

    res.json({
      success: true,
      stats: {
        totalBatches,
        activeBatches,
        inactiveBatches: await Batch.countDocuments({ adminId, status: 'inactive' }),
        archivedBatches: await Batch.countDocuments({ adminId, status: 'archived' }),
        batchesWithCoach,
        batchesWithoutCoach: totalBatches - batchesWithCoach,
        dayWiseDistribution: dayStats
      }
    });

  } catch (error) {
    console.error("Get batch stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
};