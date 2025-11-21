// controllers/batchController.js
import Batch from "../../models/batches.model.js";
import Student from '../../models/student.model.js';

// Create Batch
export const createBatch = async (req, res) => {
  try {
    const { batchName, timing, fee, weekDays } = req.body;
    const adminId = req.admin.id;

    if (!batchName) {
      return res.status(400).json({ success: false, message: "Batch name required" });
    }

    // Check duplicate batch name
    const existing = await Batch.findOne({ batchName, adminId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Batch name already exists" });
    }

    const batch = await Batch.create({
      batchName,
      timing: timing || "Not Assigned",
      fee: fee || 0,
      weekDays: weekDays || [],
      adminId,
      createdBy: req.admin.name
    });

    res.status(201).json({ 
      success: true, 
      message: "Batch created successfully", 
      batch 
    });

  } catch (error) {
    console.error("Create batch error:", error);
    res.status(500).json({ success: false, message: "Failed to create batch" });
  }
};

// Get All Batches
export const getBatches = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const batches = await Batch.find({ adminId }).sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: batches.length, 
      batches 
    });

  } catch (error) {
    console.error("Get batches error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch batches" });
  }
};

// Update Batch
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { timing, fee, weekDays, status } = req.body;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Update allowed fields
    if (timing !== undefined) batch.timing = timing;
    if (fee !== undefined) batch.fee = fee;
    if (weekDays !== undefined) batch.weekDays = weekDays;
    if (status !== undefined) batch.status = status;

    await batch.save();

    res.json({ 
      success: true, 
      message: "Batch updated successfully", 
      batch 
    });

  } catch (error) {
    console.error("Update batch error:", error);
    res.status(500).json({ success: false, message: "Failed to update batch" });
  }
};

// Delete Batch
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    // Delete batch and associated students
    await Batch.findByIdAndDelete(id);
    await Student.deleteMany({ batchId: id, adminId });

    res.json({ 
      success: true, 
      message: "Batch and students deleted successfully" 
    });

  } catch (error) {
    console.error("Delete batch error:", error);
    res.status(500).json({ success: false, message: "Failed to delete batch" });
  }
};

// Get Single Batch
export const getBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    res.json({ 
      success: true, 
      batch 
    });

  } catch (error) {
    console.error("Get batch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch batch" });
  }
};

// Assign Coach to Batch
export const assignCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { coachId, coachName } = req.body;
    const adminId = req.admin.id;

    const batch = await Batch.findOne({ _id: id, adminId });
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    batch.coachId = coachId || null;
    batch.coachName = coachName || "";

    await batch.save();

    res.json({ 
      success: true, 
      message: coachId ? "Coach assigned" : "Coach removed", 
      batch 
    });

  } catch (error) {
    console.error("Assign coach error:", error);
    res.status(500).json({ success: false, message: "Failed to assign coach" });
  }
};