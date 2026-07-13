import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

const uri = process.env.MONGODB_URI;
await mongoose.connect(uri);

const db = mongoose.connection.db;

// Check hremails collection
const hremails = await db.collection("hremails").find({}).limit(5).toArray();
console.log("──── hremails sample ────");
console.log(`Total count: ${await db.collection("hremails").countDocuments()}`);
hremails.forEach(doc => {
    console.log({
        _id: doc._id.toString(),
        email: doc.email,
        userId: doc.userId?.toString() || "NO userId",
        company: doc.company,
    });
});

// Check users collection
console.log("\n──── users ────");
const users = await db.collection("users").find({}).toArray();
users.forEach(u => {
    console.log({
        _id: u._id.toString(),
        email: u.email,
        name: u.name,
    });
});

await mongoose.disconnect();
console.log("\nDone.");
