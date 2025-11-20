// app.js
import express from "express";
import cors from "cors";

// Routers
import adminRouter from "./src/routes/auth.route.js";
import BatchRouter from "./src/routes/batch.routes.js";
import CoachRouter from "./src/routes/coach.routes.js";
import StudentRouter from "./src/routes/student.route.js";
import CoachMangeRouter from "./src/routes/CoachRouter/coachManage.route.js";
import AttendanceRouter from "./src/routes/CoachRouter/attendance.route.js";
import FeeRouter from "./src/routes/CoachRouter/fee.route.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/admin", BatchRouter);
app.use("/api/admin", CoachRouter);
app.use("/api/admin", StudentRouter);

app.use("/api/coach", CoachMangeRouter);
app.use("/api/coach", AttendanceRouter);
app.use("/api/coach", FeeRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
