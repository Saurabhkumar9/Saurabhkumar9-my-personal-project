// In your routes file (admin.routes.js)
import express from "express";
import { attendanceMarked, attendanceUnMarked } from "../../controllers/coachController/attendance.controller.js";


const AttendanceRouter = express.Router();

// Coach routes

AttendanceRouter.post('/marked/attendance', attendanceMarked)
AttendanceRouter.post('/unmarked/attendance', attendanceUnMarked)


export default AttendanceRouter;