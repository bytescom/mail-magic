import mongoose from "mongoose";
import { MONGODB_URL } from "@/config/env.js";

export const connectDB = async () => {
  let client = await mongoose.connect(MONGODB_URL);
  console.log("MongoDB connected to ", client.connection.host);
};