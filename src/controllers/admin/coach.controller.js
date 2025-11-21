import Coach from "../../models/coach.model.js";
import Batch from "../../models/batches.model.js";
import handleErrors from "../../middleware/handleErrors.js";




// Create coach with batch assignment
export const createCoach = async (req, res, next) => {
  try {
    const { name, email, phone, batches } = req.body;
    const adminId = req.admin.id;

    // Validation
    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return next(handleErrors(400, "Name, email and phone are required"));
    }

    // Check if coach with email already exists
    const existingCoach = await Coach.findOne({ 
      email: email.toLowerCase().trim(), 
      adminId 
    });
    
    if (existingCoach) {
      return next(handleErrors(400, "Coach with this email already exists"));
    }

    // Validate batches if provided
    if (batches && batches.length > 0) {
      // Get all batches that belong to this admin
      const adminBatches = await Batch.find({ adminId });
      
      // Check if all provided batches exist and belong to admin
      const validBatchIds = adminBatches.map(batch => batch._id.toString());
      const invalidBatches = batches.filter(batchId => !validBatchIds.includes(batchId));
      
      if (invalidBatches.length > 0) {
        return next(handleErrors(400, "One or more batches are invalid"));
      }

      // Check for already assigned batches
      const assignedBatches = adminBatches.filter(batch => 
        batch.coachId && batches.includes(batch._id.toString())
      );

      if (assignedBatches.length > 0) {
        const assignedBatchNames = assignedBatches.map(batch => 
          `${batch.batchName}`
        ).join(', ');
        
        return next(handleErrors(400, 
          `Cannot assign batches that are already assigned to other coaches: ${assignedBatchNames}`
        ));
      }

      // Check for timing conflicts
      const selectedBatches = adminBatches.filter(batch => 
        batches.includes(batch._id.toString())
      );

      const timingMap = {};
      const conflictingBatches = [];

      selectedBatches.forEach(batch => {
        if (batch.timing && batch.timing !== "Not Assigned") {
          if (timingMap[batch.timing]) {
            conflictingBatches.push({
              batchName: batch.batchName,
              timing: batch.timing
            });
          } else {
            timingMap[batch.timing] = batch.batchName;
          }
        }
      });

      if (conflictingBatches.length > 0) {
        const conflictDetails = conflictingBatches.map(conflict => 
          `${conflict.batchName} (${conflict.timing})`
        ).join(', ');
        
        return next(handleErrors(400, 
          `Timing conflicts: ${conflictDetails}. Coach cannot handle multiple batches at same time.`
        ));
      }
    }

    // Create coach
    const coach = new Coach({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      assignedBatches: batches || [],
      adminId,
      status: 'active'
    });

    await coach.save();

    // Update batch assignments
    if (batches && batches.length > 0) {
      await Batch.updateMany(
        { _id: { $in: batches } },
        { 
          coachId: coach._id,
          coachName: coach.name
        }
      );
    }

    // Populate response
    const populatedCoach = await Coach.findById(coach._id)
      .populate('assignedBatches', 'batchName timing fee status weekDays');

    res.status(201).json({
      success: true,
      message: "Coach created successfully",
      coach: populatedCoach
    });
  } catch (err) {
    next(err);
  }
};

// Get available batches for assignment (only unassigned batches)
export const getAvailableBatches = async (req, res, next) => {
  try {
    const adminId = req.admin.id;
    const { coachId } = req.query;

    // Find all batches that belong to admin and are either unassigned or assigned to this specific coach
    const batches = await Batch.find({ 
      adminId,
      status: 'active'
    })
    .select('batchName timing fee status weekDays coachId coachName')
    .sort({ batchName: 1 });

    // Filter: show only unassigned batches OR batches already assigned to this coach
    const availableBatches = batches.filter(batch => 
      !batch.coachId || (coachId && batch.coachId.toString() === coachId)
    );

    res.status(200).json({
      success: true,
      batches: availableBatches,
      totalBatches: availableBatches.length
    });
  } catch (err) {
    next(err);
  }
};

// Other functions remain the same as your original implementation...
// getCoachesOfAdmin, assignBatchesToCoach, unassignBatchFromCoach, etc.


// Get all coaches for admin
export const getCoachesOfAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin.id;

    const coaches = await Coach.find({ adminId })
      .populate('assignedBatches', 'batchName timing fee status weekDays')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coaches: coaches.map(coach => ({
        _id: coach._id,
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        status: coach.status,
        assignedBatches: coach.assignedBatches,
        batchCount: coach.assignedBatches.length,
        createdAt: coach.createdAt
      })),
      totalCoaches: coaches.length
    });
  } catch (err) {
    next(err);
  }
};

// Get available batches for assignment (only unassigned batches)


// Assign batches to coach with enhanced validation
export const assignBatchesToCoach = async (req, res, next) => {
  try {
    const coachId = req.params.id;
    const { batchIds } = req.body;
    const adminId = req.admin.id;

    if (!batchIds || !Array.isArray(batchIds)) {
      return next(handleErrors(400, "Batch IDs array is required"));
    }

    // Get coach
    const coach = await Coach.findOne({ _id: coachId, adminId });
    if (!coach) {
      return next(handleErrors(404, "Coach not found"));
    }

    // Validate batches
    const validBatches = await Batch.find({ 
      _id: { $in: batchIds }, 
      adminId 
    });
    
    if (validBatches.length !== batchIds.length) {
      return next(handleErrors(400, "One or more batches are invalid"));
    }

    // Check for batches already assigned to other coaches
    const alreadyAssignedBatches = validBatches.filter(batch => 
      batch.coachId && batch.coachId.toString() !== coachId
    );

    if (alreadyAssignedBatches.length > 0) {
      const assignedBatchNames = alreadyAssignedBatches.map(batch => 
        `${batch.batchName} (currently assigned to ${batch.coachName || 'another coach'})`
      ).join(', ');
      
      return next(handleErrors(400, 
        `Cannot assign batches that are already assigned to other coaches: ${assignedBatchNames}. ` +
        `Please unassign them from their current coach first.`
      ));
    }

    // Check for timing conflicts
    const timingMap = {};
    const conflictingBatches = [];

    validBatches.forEach(batch => {
      if (batch.timing && batch.timing !== "Not Assigned") {
        if (timingMap[batch.timing]) {
          conflictingBatches.push({
            batchName: batch.batchName,
            timing: batch.timing
          });
        } else {
          timingMap[batch.timing] = batch.batchName;
        }
      }
    });

    if (conflictingBatches.length > 0) {
      const conflictDetails = conflictingBatches.map(conflict => 
        `${conflict.batchName} (${conflict.timing})`
      ).join(', ');
      
      return next(handleErrors(400, 
        `Timing conflicts detected: ${conflictDetails}. ` +
        `A coach cannot be assigned multiple batches at the same time.`
      ));
    }

    // Remove coach from previous batches (only if they're assigned to this coach)
    await Batch.updateMany(
      { coachId: coachId },
      { 
        $unset: { coachId: "", coachName: "" }
      }
    );

    // Assign new batches
    coach.assignedBatches = batchIds;
    await coach.save();

    // Update batches with coach info
    await Batch.updateMany(
      { _id: { $in: batchIds } },
      { 
        coachId: coach._id,
        coachName: coach.name
      }
    );

    await coach.populate('assignedBatches', 'batchName timing fee status weekDays');

    res.status(200).json({
      success: true,
      message: "Batches assigned successfully",
      coach: {
        _id: coach._id,
        name: coach.name,
        assignedBatches: coach.assignedBatches,
        batchCount: coach.assignedBatches.length
      },
    });
  } catch (err) {
    next(err);
  }
};

// Unassign batch from coach
export const unassignBatchFromCoach = async (req, res, next) => {
  try {
    const { coachId, batchId } = req.params;
    const adminId = req.admin.id;

    // Verify coach exists and belongs to admin
    const coach = await Coach.findOne({ _id: coachId, adminId });
    if (!coach) {
      return next(handleErrors(404, "Coach not found"));
    }

    // Verify batch exists and belongs to admin
    const batch = await Batch.findOne({ _id: batchId, adminId });
    if (!batch) {
      return next(handleErrors(404, "Batch not found"));
    }

    // Verify batch is assigned to this coach
    if (batch.coachId?.toString() !== coachId) {
      return next(handleErrors(400, "Batch is not assigned to this coach"));
    }

    // Remove batch from coach's assigned batches
    coach.assignedBatches = coach.assignedBatches.filter(
      batch => batch.toString() !== batchId
    );
    await coach.save();

    // Remove coach from batch
    batch.coachId = null;
    batch.coachName = null;
    await batch.save();

    await coach.populate('assignedBatches', 'batchName timing fee status weekDays');

    res.status(200).json({
      success: true,
      message: "Batch unassigned successfully",
      coach: {
        _id: coach._id,
        name: coach.name,
        assignedBatches: coach.assignedBatches,
        batchCount: coach.assignedBatches.length
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get batches assigned to specific coach
export const getCoachBatches = async (req, res, next) => {
  try {
    const coachId = req.params.id;
    const adminId = req.admin.id;

    const coach = await Coach.findOne({ _id: coachId, adminId })
      .populate('assignedBatches', 'batchName timing fee status weekDays');

    if (!coach) {
      return next(handleErrors(404, "Coach not found"));
    }

    res.status(200).json({
      success: true,
      batches: coach.assignedBatches,
      totalBatches: coach.assignedBatches.length,
      coach: {
        _id: coach._id,
        name: coach.name,
        email: coach.email
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update coach status
export const updateCoachStatus = async (req, res, next) => {
  try {
    const coachId = req.params.id;
    const { status } = req.body;
    const adminId = req.admin.id;

    if (!['active', 'inactive'].includes(status)) {
      return next(handleErrors(400, "Status must be either 'active' or 'inactive'"));
    }

    const coach = await Coach.findOne({ _id: coachId, adminId });
    if (!coach) {
      return next(handleErrors(404, "Coach not found"));
    }

    // If deactivating coach, remove all batch assignments
    if (status === 'inactive') {
      // Remove coach from all assigned batches
      await Batch.updateMany(
        { coachId: coachId },
        { 
          $unset: { coachId: "", coachName: "" }
        }
      );

      // Clear assigned batches array from coach
      coach.assignedBatches = [];
    }

    coach.status = status;
    await coach.save();

    // Populate coach data for response
    const updatedCoach = await Coach.findById(coachId)
      .populate('assignedBatches', 'batchName timing fee status weekDays');

    res.status(200).json({
      success: true,
      message: `Coach ${status} successfully`,
      coach: {
        _id: updatedCoach._id,
        name: updatedCoach.name,
        status: updatedCoach.status,
        assignedBatches: updatedCoach.assignedBatches,
        batchCount: updatedCoach.assignedBatches.length
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete coach
export const deleteCoach = async (req, res, next) => {
  try {
    const coachId = req.params.id;
    const adminId = req.admin.id;

   

    const coach = await Coach.findOne({ _id: coachId, adminId });
    if (!coach) {
      return next(handleErrors(404, "Coach not found"));
    }

    // Remove coach from all assigned batches
    await Batch.updateMany(
      { coachId: coachId },
      { 
        $unset: { coachId: "", coachName: "" }
      }
    );

   

    await Coach.findByIdAndDelete(coachId);

    res.status(200).json({
      success: true,
      message: "Coach deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Get single coach
export const getCoachById = async (req, res, next) => {
  try {
    const coachId = req.params.id;
    const adminId = req.admin.id;

    const coach = await Coach.findOne({ _id: coachId, adminId })
      .populate('assignedBatches', 'batchName timing fee status weekDays');

    if (!coach) {
      return next(handleErrors(404, "Coach not found"));
    }

    res.status(200).json({
      success: true,
      coach: {
        _id: coach._id,
        name: coach.name,
        email: coach.email,
        phone: coach.phone,
        status: coach.status,
        assignedBatches: coach.assignedBatches,
        batchCount: coach.assignedBatches.length,
        createdAt: coach.createdAt
      },
    });
  } catch (err) {
    next(err);
  }
};