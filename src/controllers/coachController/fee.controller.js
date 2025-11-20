// controllers/feeController.js
import Student from '../../models/admin/student.model.js';
import Batch  from '../../models/admin/batches.model.js'



export const payFee = async (req, res, next) => {
  try {
    const { studentId, batchId, month } = req.body;

//    console.log(studentId)
    if (!studentId || !batchId || !month) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Batch ID, and Month are required"
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if fee already paid for this month
    const alreadyPaid = student.fee.some(feeRecord => 
      feeRecord.month === month
    );

    if (alreadyPaid) {
      return res.status(400).json({
        success: false,
        message: `Fee for ${month} is already paid`
      });
    }

   

    const batchFee=await Batch.findOne({
        _id:batchId
    }).select('fee')

   

    // Add new fee record
    const newFeeRecord = {
      month: month,
      amount: batchFee.fee,
      date: new Date(),
      status:"paid"
    };

    student.fee.push(newFeeRecord);
    await student.save();

    res.status(200).json({
      success: true,
      message: `Fee for ${month} paid successfully`,
      feeRecord: newFeeRecord
    });

  } catch (error) {
    next(error);
  }
};

export const UnpayFee = async (req, res, next) => {
  try {
    const { studentId, batchId, month } = req.body;

    if (!studentId || !batchId || !month) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Batch ID, and Month are required"
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Find the fee record for this month
    const feeRecord = student.fee.find(f => f.month === month);

    if (!feeRecord) {
      return res.status(400).json({
        success: false,
        message: `Fee for ${month} is not paid`
      });
    }

    // Remove fee record
    student.fee.pull({ _id: feeRecord._id });
    await student.save();

    res.status(200).json({
      success: true,
      message: `Fee for ${month} removed successfully`,
      removedFee: feeRecord
    });

  } catch (error) {
    next(error);
  }
};

export const payFeeCurrentMonth = async (req, res, next) => {
  try {
    const { studentIds,batchId} = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "No students selected" });
    }

    // Get Current Month name and Year
    const date = new Date();
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const currentMonth = `${monthName} ${date.getFullYear()}`;

    // Find students who already paid this month
    const alreadyPaid = await Student.find({
      _id: { $in: studentIds },
      "fee.month": currentMonth
    }).select("_id");

     const batchFee=await Batch.findOne({
        _id:batchId
    }).select('fee')

   
    const alreadyPaidIds = alreadyPaid.map(s => s._id.toString());

    // Students who need to be marked paid
    const toPay = studentIds.filter(id => !alreadyPaidIds.includes(id));

    if (toPay.length === 0) {
      return res.status(200).json({
        message: "All students already paid for this month",
        alreadyPaid: alreadyPaidIds
      });
    }

    // Pay fee for remaining students
    await Student.updateMany(
      { _id: { $in: toPay } },
      {
        $push: {
          fee: {
            month: currentMonth,
            status: "paid",
            amount: batchFee.fee || 0,
            // date: new Date()
          }
        }
      }
    );

    res.status(200).json({
      message: "Fee marked as paid",
      paidStudents: toPay,
      alreadyPaid: alreadyPaidIds
    });

  } catch (error) {
    next(error);
  }
};
