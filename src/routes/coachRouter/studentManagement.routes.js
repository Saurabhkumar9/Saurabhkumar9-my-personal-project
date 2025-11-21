// In your routes file (admin.routes.js)
import express from "express";

import { authenticateCoach } from "../../middleware/auth.coach.js";
import { createStudentByCoach, deleteStudentById, getBatchDetails, studentDetailsById, studentEditById } from "../../controllers/coachController/studentManagement.controller.js";
import { excelUploadStudentsByCoach } from "../../controllers/admin/excel.upload.controller.js";

const CoachMangeRouter = express.Router();

// Coach routes


CoachMangeRouter.get('/fetch-student/belong-to-coach/:batchId', getBatchDetails)
CoachMangeRouter.get('/fetch-student-details/:studentId', studentDetailsById)
CoachMangeRouter.post('/update/student/:studentId', studentEditById)
CoachMangeRouter.delete('/delete/student/:studentId', deleteStudentById)
CoachMangeRouter.post('/create/student/:batchId',authenticateCoach, createStudentByCoach)

// excel uplaod by  coach
CoachMangeRouter.post('/bulk-upload-students/:batchId',authenticateCoach, excelUploadStudentsByCoach)


export default CoachMangeRouter;