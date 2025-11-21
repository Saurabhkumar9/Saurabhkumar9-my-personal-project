import express from 'express';
import {
  excelUploadStudentsByAdmin,
  excelUploadStudentsByCoach,
} from '../../controllers/admin/excel.upload.controller.js';
import { authenticateAdmin } from '../../middleware/auth.admin.js';


const ExcelRouter = express.Router();

// Admin routes
ExcelRouter.post('/bulk-upload-students/:batchId',authenticateAdmin, excelUploadStudentsByAdmin);
ExcelRouter.post('/bulk-upload-students/:batchId',authenticateAdmin, excelUploadStudentsByCoach)

export default ExcelRouter;