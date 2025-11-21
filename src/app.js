// app.js
import express from "express";
import cors from "cors";

// Routers
import authRouter from "../src/routes/admin/auth.routes.js";
import BatchRouter from "../src/routes/admin/batch.route.js";
import CoachRouter from "../src/routes/admin/coach.route.js";
import StudentRouter from "../src/routes/admin/student.route.js";
import ExcelRouter from "../src/routes/admin/excel.route.js";
import CoachAuthRouter from "../src/routes/coachRouter/coach.auth.route.js";
// import CoachMangeRouter from "./src/routes/CoachRouter/coachManage.route.js";
import AttendanceRouter from "../src/routes/coachRouter/attendace.route.js";
import CoachMangeRouter from "./routes/coachRouter/studentManagement.routes.js";
import FeeRouter from "./routes/coachRouter/fee.routes.js";
// import FeeRouter from "./src/routes/CoachRouter/fee.route.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", authRouter);
app.use("/api/admin", BatchRouter);
app.use("/api/admin", CoachRouter);
app.use("/api/admin", StudentRouter);
app.use('/api/admin', ExcelRouter)
app.use('/api/coach', CoachAuthRouter)

app.use("/api/coach", AttendanceRouter);
app.use("/api/coach", CoachMangeRouter);
app.use("/api/coach", FeeRouter);
// app.use("/api/coach", FeeRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
