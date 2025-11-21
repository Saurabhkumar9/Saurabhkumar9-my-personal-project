// routes/studentRoutes.js
import express from 'express';
import {
  createStudent,
  getAllStudents,
  
  deleteStudent,
  
} from '../../controllers/admin/student.controller.js';
import { authenticateAdmin } from '../../middleware/auth.admin.js';


const StudentRouter = express.Router();

StudentRouter.post('/register/student/:batchId',authenticateAdmin, createStudent);
StudentRouter.get('/fetch-students',authenticateAdmin, getAllStudents);


StudentRouter.delete('/delete/student/:id',authenticateAdmin, deleteStudent);





export default StudentRouter;