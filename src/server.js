// index.js
import dotenv from "dotenv";
import cron from "node-cron";
import app from "./app.js";
import databaseConnection from "./src/config/db.js";
import checkFee from "./src/job/fee.reminder.js";

dotenv.config();

// Database Connection
databaseConnection();

// Cron Job (Optional)
// cron.schedule("* * * * *", () => {
//   console.log("Cron Running: Student fee status checked at", new Date());
//   checkFee();
// });

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
