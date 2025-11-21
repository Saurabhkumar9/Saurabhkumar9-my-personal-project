import Student from "../../models/student.model.js";
import handleErrors from "../../middleware/handleErrors.js";


const attendanceMarked = async (req, res, next) => {
  try {
    const { presentStudents } = req.body;

    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Find students who already have attendance marked for today
    const alreadyMarkedStudents = await Student.find({
      _id: { $in: presentStudents },
      "attendance.date": {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).select("_id");

    const alreadyIds = alreadyMarkedStudents.map(s => s._id.toString());

    const toMark = presentStudents.filter(id => !alreadyIds.includes(id));

    if (toMark.length === 0) {
      return res.status(200).json({
        message: "All students already marked for today",
        alreadyMarked: alreadyIds
      });
    }

    // Mark attendance for remaining students
    const data = await Student.updateMany(
      { _id: { $in: toMark } },
      {
        $push: {
          attendance: {
            Date: new Date(), // Use current date object
            status: "present"
          }
        }
      }
    );

    res.status(200).json({
      message: "Attendance marked for remaining students",
      marked: toMark,
      skipped: alreadyIds
    });

  } catch (error) {
    next(error);
  }
};


const attendanceUnMarked = async (req, res, next) => {
  try {
    const { studentIds } = req.body;

    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    
    const studentsWithAttendanceToday = await Student.find({
      _id: { $in: studentIds },
      "attendance.date": {
        $gte: todayStart,
        $lte: todayEnd
      }
    }).select("_id");

    const markedIds = studentsWithAttendanceToday.map(s => s._id.toString());

   
    const notMarked = studentIds.filter(id => !markedIds.includes(id));


    if (markedIds.length === 0) {
      return res.status(200).json({
        message: "No student has today's attendance",
        unmarked: [],
        skipped: notMarked
      });
    }

    
    await Student.updateMany(
      { _id: { $in: markedIds } },
      {
        $pull: {
          attendance: {
            date: {
              $gte: todayStart,
              $lte: todayEnd
            }
          }
        }
      }
    );

    return res.status(200).json({
      message: "Attendance unmarked successfully for today",
      unmarked: markedIds,
      skipped: notMarked
    });

  } catch (error) {
    next(error);
  }
};


export {attendanceMarked,attendanceUnMarked}