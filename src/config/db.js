import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(` MongoDB Connected`);
  } catch (error) {
    console.error(" MongoDB Connection Failed");
    console.error("Reason:", error.message);

    // Exit process with failure (for production restart managers like PM2 / Docker)
    process.exit(1);
  }
};

export default connectDB;

