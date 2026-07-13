import mongoose from "mongoose";
import { MONGODB_URL } from "@/config/env.js";
import dns from "dns";

// Force Node.js to resolve DNS using IPv4 first. 
// This fixes querySrv ECONNREFUSED on local networks resolving MongoDB Atlas.
dns.setDefaultResultOrder("ipv4first");

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  if (mongoose.connections[0]?.readyState) {
    isConnected = true;
    return;
  }

  try {
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URI environment variable is missing in your .env file!");
    }
    
    // Log target host securely
    const secureUrl = MONGODB_URL.replace(/\/\/([^:]+):([^@]+)@/, "//****:****@");
    console.log(`🔌 Attempting database connection to: ${secureUrl}`);

    const client = await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
    });

    isConnected = true;
    console.log(`✅ MongoDB connected successfully: ${client.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};