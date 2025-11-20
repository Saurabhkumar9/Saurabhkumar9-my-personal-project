// controllers/coachController.js
import Coach from "../models/Coach.js";
import Batch from "../models/Batch.js";

/**
 * Create Coach
 */
export const createCoach = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience } = req.body;
    const adminId = req.admin.id;

    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required"
      });
    }

    // Check if coach already exists
    const existingCoach = await Coach.findOne({ 
      email: email.toLowerCase(), 
      adminId 
    });
    
    if (existingCoach) {
      return res.status(400).json({
        success: false,
        message: "Coach with this email already exists"
      });
    }

    // Create coach
    const coach = new Coach({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      specialization: specialization?.trim() || "General",
      experience: experience || 0,
      adminId
    });

    await coach.save();

    res.status(201).json({
      success: true,
      message: "Coach created successfully",
      coach
    });

  } catch (error) {
    console.error("Create coach error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coach"
    });
  }
};

/**
 * Get All Coaches
 */
export const getCoaches = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { page = 1, limit = 10, status, search } = req.query;

    // Build query
    const query = { adminId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const coaches = await Coach.find(query)
      .select("-otp -tokenVersion")
      .populate("assignedBatches", "batchName timing")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Coach.countDocuments(query);

    res.json({
      success: true,
      coaches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get coaches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coaches"
    });
  }
};

/**
 * Get Single Coach
 */
export const getCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const coach = await Coach.findOne({ _id: id, adminId })
      .select("-otp -tokenVersion")
      .populate("assignedBatches", "batchName timing fee currentStrength");

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    res.json({
      success: true,
      coach
    });

  } catch (error) {
    console.error("Get coach error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coach"
    });
  }
};

/**
 * Update Coach
 */
export const updateCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, specialization, experience, status } = req.body;
    const adminId = req.admin.id;

    const coach = await Coach.findOne({ _id: id, adminId });
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    // Update fields
    if (name) coach.name = name.trim();
    if (phone) coach.phone = phone.trim();
    if (specialization) coach.specialization = specialization.trim();
    if (experience) coach.experience = experience;
    if (status) coach.status = status;

    await coach.save();

    const updatedCoach = await Coach.findById(id)
      .select("-otp -tokenVersion")
      .populate("assignedBatches", "batchName timing");

    res.json({
      success: true,
      message: "Coach updated successfully",
      coach: updatedCoach
    });

  } catch (error) {
    console.error("Update coach error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coach"
    });
  }
};

/**
 * Delete Coach
 */
export const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const coach = await Coach.findOne({ _id: id, adminId });
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    // Check if coach has assigned batches
    if (coach.assignedBatches.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete coach with assigned batches"
      });
    }

    await Coach.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Coach deleted successfully"
    });

  } catch (error) {
    console.error("Delete coach error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coach"
    });
  }
};

/**
 * Assign Batches to Coach
 */
export const assignBatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { batchIds } = req.body;
    const adminId = req.admin.id;

    if (!batchIds || !Array.isArray(batchIds)) {
      return res.status(400).json({
        success: false,
        message: "Batch IDs array is required"
      });
    }

    const coach = await Coach.findOne({ _id: id, adminId });
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    // Check if batches exist and belong to admin
    const batches = await Batch.find({ 
      _id: { $in: batchIds }, 
      adminId 
    });

    if (batches.length !== batchIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some batches not found"
      });
    }

    // Check if batches are already assigned to other coaches
    const alreadyAssigned = await Coach.findOne({
      adminId,
      _id: { $ne: id },
      assignedBatches: { $in: batchIds }
    });

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "Some batches are already assigned to another coach"
      });
    }

    // Assign batches
    coach.assignedBatches = batchIds;
    await coach.save();

    const updatedCoach = await Coach.findById(id)
      .populate("assignedBatches", "batchName timing");

    res.json({
      success: true,
      message: "Batches assigned successfully",
      coach: updatedCoach
    });

  } catch (error) {
    console.error("Assign batches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign batches"
    });
  }
};

/**
 * Update Coach Status
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.admin.id;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive"
      });
    }

    const coach = await Coach.findOne({ _id: id, adminId });
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }

    coach.status = status;
    await coach.save();

    res.json({
      success: true,
      message: `Coach status updated to ${status}`,
      coach: {
        id: coach._id,
        name: coach.name,
        status: coach.status
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