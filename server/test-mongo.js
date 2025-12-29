import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Chit-chat MongoDB Connected!");
    
    // Test collections
    const db = mongoose.connection.db;
    await db.createCollection("users");
    await db.createCollection("rooms");
    console.log("✅ Collections created: users, rooms");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

test();
