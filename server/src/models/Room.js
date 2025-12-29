import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true }, // 8 chars
    name: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
