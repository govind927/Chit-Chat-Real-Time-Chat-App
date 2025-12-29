import dotenv from "dotenv";
dotenv.config();

console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "✅ YES" : "❌ NO");
console.log("First 50 chars:", process.env.MONGO_URI?.substring(0, 50));
